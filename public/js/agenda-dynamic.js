/**
 * Génère le HTML d'un agenda
 */
function renderAgenda(agenda, userId) {
    const isOwner = userId.toString() === agenda.user.toString();
    
    return `
        <div class="flex items-center justify-between px-4 py-3" data-agenda="${agenda._id}">
            <div>
                <p class="font-semibold">
                    ${agenda.nom}
                    ${!isOwner ? '(Partagé avec vous)' : ''}
                </p>
                ${agenda.description ? `<p class="text-sm">${agenda.description}</p>` : ''}
            </div>

            <div class="flex gap-2">
                <div class="px-3 py-1 rounded cursor-pointer bg-sky-500 text-sm hover:bg-sky-400" data-action="invite">
                    Invitation
                </div>
                ${isOwner ? `
                    <div class="px-3 py-1 rounded cursor-pointer bg-amber-500 text-sm hover:bg-amber-400" data-action="edit">
                        Modifier
                    </div>
                    <div class="px-3 py-1 rounded cursor-pointer bg-purple-500 text-sm hover:bg-purple-400" data-action="export">
                        Exporter
                    </div>
                ` : `
                    <form action="/invitation/${agenda._id}/remove/${userId}" method="GET" class="inline-form">
                        <button type="submit" class="px-3 py-1 rounded cursor-pointer bg-red-500 text-sm hover:bg-red-400">
                            Quitter
                        </button>
                    </form>
                `}
            </div>
        </div>
    `;
}

/**
 * Recharge tous les agendas
 */
async function reloadAgendas() {
    try {
        const response = await fetch("/api/agendas");
        const result = await response.json();

        if (result.success) {
            const container = document.querySelector(".list-agendas");
            
            if (result.agendas.length === 0) {
                container.innerHTML = '<p class="text-center p-4">Aucun agenda pour le moment.</p>';
            } else {
                container.innerHTML = result.agendas
                    .map(a => renderAgenda(a, result.userId))
                    .join("");
                
                // Réattache les événements
                attachAgendaEventListeners();
            }
        }
    } catch (error) {
        console.error("Erreur lors du rechargement des agendas:", error);
        await creerToast("Erreur lors du rechargement des agendas", "echec");
    }
}

/**
 * Attache les événements aux boutons des agendas
 */
function attachAgendaEventListeners() {
    // Bouton Invitation
    document.querySelectorAll("[data-action='invite']").forEach(el => {
        el.addEventListener("click", async (e) => {
            const agendaEl = e.target.closest("[data-agenda]");
            await openModal(`/invitation/${agendaEl.dataset.agenda}/manage`);
        });
    });

    // Bouton Modifier
    document.querySelectorAll("[data-action='edit']").forEach(el => {
        el.addEventListener("click", async (e) => {
            const agendaEl = e.target.closest("[data-agenda]");
            await openModal(`/agendas/edit/${agendaEl.dataset.agenda}`);
            updateColorPreview();
        });
    });

    // Bouton Exporter
    document.querySelectorAll("[data-action='export']").forEach(el => {
        el.addEventListener("click", async (e) => {
            const agendaEl = e.target.closest("[data-agenda]");
            await openModal(`/agendas/export/${agendaEl.dataset.agenda}`);
        });
    });

    // Formulaires de quitter un agenda partagé
    document.querySelectorAll(".inline-form").forEach(form => {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const confirmed = await showConfirmation(
                "Voulez-vous vraiment quitter cet agenda partagé ?",
                false,
                "Quitter"
            );
            
            if (confirmed.confirmation) {
                try {
                    const response = await fetch(form.action, {
                        method: "GET"
                    });
                    
                    if (response.ok) {
                        await reloadAgendas();
                        await creerToast("Vous avez quitté l'agenda", "supprimer");
                    }
                } catch (error) {
                    console.error("Erreur:", error);
                    await creerToast("Erreur lors de l'opération", "echec");
                }
            }
        });
    });
}

/**
 * Soumet un formulaire d'agenda
 */
async function submitAgendaForm(form, action) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    let url = "/api/agendas";
    let method = "POST";

    if (action === "update") {
        const agendaId = form.action.split('/').pop();
        url = `/api/agendas/${agendaId}`;
        method = "PUT";
    } else if (action === "delete") {
        const agendaId = form.action.split('/').pop();
        url = `/api/agendas/${agendaId}`;
        method = "DELETE";
    } else if (action === "export") {
        // Pour l'export, on télécharge le fichier
        const agendaId = form.action.split('/').pop();
        try {
            const response = await fetch(`/api/agendas/${agendaId}/export`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${data.nom || 'agenda'}.ics`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                document.querySelector("#modal-overlay").classList.add("hidden");
                document.querySelector("#modal-overlay").classList.remove("flex");
                document.querySelector("#modal-container").innerHTML = "";
                
                await creerToast("Agenda exporté avec succès", "succes");
            } else {
                await creerToast("Erreur lors de l'export", "echec");
            }
        } catch (error) {
            console.error("Erreur:", error);
            await creerToast("Erreur lors de l'export", "echec");
        }
        return;
    } else if (action === "import") {
        // Pour l'import, on gère le fichier
        const fileInput = form.querySelector('input[type="file"]');
        const file = fileInput.files[0];
        
        if (!file) {
            await creerToast("Veuillez sélectionner un fichier", "echec");
            return;
        }
        
        const formDataWithFile = new FormData();
        formDataWithFile.append('file', file);
        formDataWithFile.append('nom', data.nom);
        formDataWithFile.append('description', data.description || '');
        formDataWithFile.append('couleur', data.couleur);
        
        try {
            const response = await fetch("/api/agendas/import", {
                method: "POST",
                body: formDataWithFile
            });
            
            const result = await response.json();
            
            if (result.success) {
                document.querySelector("#modal-overlay").classList.add("hidden");
                document.querySelector("#modal-overlay").classList.remove("flex");
                document.querySelector("#modal-container").innerHTML = "";
                
                await reloadAgendas();
                await creerToast(result.message, "create");
            } else {
                await creerToast(result.error || "Erreur lors de l'import", "echec");
            }
        } catch (error) {
            console.error("Erreur:", error);
            await creerToast("Erreur lors de l'import", "echec");
        }
        return;
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            document.querySelector("#modal-overlay").classList.add("hidden");
            document.querySelector("#modal-overlay").classList.remove("flex");
            document.querySelector("#modal-container").innerHTML = "";

            // Recharge les agendas
            await reloadAgendas();

            await creerToast(result.message, action === "delete" ? "supprimer" : action);
        } else {
            await creerToast(result.error || "Une erreur est survenue", "echec");
        }
    } catch (error) {
        console.error("Erreur:", error);
        await creerToast("Erreur lors de l'opération", "echec");
    }
}

/**
 * Met à jour l'aperçu de la couleur dans le formulaire
 */
function updateColorPreview() {
    const select = document.getElementById('couleur');
    const preview = document.getElementById('color-preview');
    
    if (!select || !preview) return;

    const selected = select.options[select.selectedIndex];
    const colorClass = selected.dataset.color;
    preview.className = `absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-stone-400 ${colorClass}`;
}

/**
 * Gestion des événements
 */
document.addEventListener("DOMContentLoaded", () => {
    if (!window.location.pathname.includes("/agendas")) return;

    // Attacher les événements initiaux
    attachAgendaEventListeners();

    // Bouton Nouvel agenda
    const newBtn = document.querySelector("[data-action='new']");
    if (newBtn) {
        newBtn.addEventListener("click", async () => {
            await openModal("/agendas/new");
            updateColorPreview();
        });
    }

    // Bouton Importer
    const importBtn = document.querySelector("[data-action='import']");
    if (importBtn) {
        importBtn.addEventListener("click", async () => {
            await openModal("/agendas/import/");
            updateColorPreview();
        });
    }

    // Intercepte les soumissions de formulaires
    document.addEventListener("submit", async (e) => {
        const form = e.target;
        if (form.action.includes("/invitation")) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        // Formulaire de création
        if (form.action.includes("/agendas/add")) {
            e.preventDefault();
            await submitAgendaForm(form, "create");
        }
        
        // Formulaire de modification
        else if (form.action.includes("/agendas/edit/")) {
            e.preventDefault();
            const actionType = e.submitter.value;

            if (actionType === "Supprimer") {
                const confirmed = await showConfirmation(
                    "Voulez-vous vraiment supprimer cet agenda ?",
                    false,
                    "Supprimer"
                );
                
                if (confirmed.confirmation) {
                    await submitAgendaForm(form, "delete");
                }
            } else {
                await submitAgendaForm(form, "update");
            }
        }
        
        // Formulaire d'export
        else if (form.action.includes("/agendas/export/")) {
            e.preventDefault();
            await submitAgendaForm(form, "export");
        }
        
        // Formulaire d'import
        else if (form.action.includes("/agendas/import/")) {
            e.preventDefault();
            await submitAgendaForm(form, "import");
        }
    });

    // Gestion du changement de couleur
    document.addEventListener("change", (e) => {
        if (e.target.id === "couleur") {
            updateColorPreview();
        }
    });
});