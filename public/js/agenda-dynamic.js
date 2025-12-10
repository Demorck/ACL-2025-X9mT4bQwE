/**
 * Génère le HTML d'un agenda
 */
function renderAgenda(agenda, userId) {
    const isOwner = userId.toString() === agenda.user.toString();
    
    return `
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-lg  transition-colors"
            data-agenda="${agenda._id}">
            <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="inline-block w-3 h-3 rounded-full filter-color-${agenda.couleur}"></span>
              <p class="font-semibold text-lg">${agenda.nom}</p>
              ${isOwner ? `` : `
                <span class="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">Partagé</span>
              `}
            </div>
            ${agenda.description ? `<p class="text-sm opacity-75 ml-5">${agenda.description}</p>` : ''}
          </div>

          <div class="flex flex-wrap gap-2">
            <button class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors font-medium" 
                    data-action="invite"
                    title="Gérer les invitations">
              <i class="fa fa-user-plus"></i>
              <span class="hidden sm:inline">Invitations</span>
            </button>
                ${isOwner ? `
                    <button class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer bg-amber-600 hover:bg-amber-700 text-white text-sm transition-colors font-medium" 
                      data-action="edit"
                      title="Modifier l'agenda">
                        <i class="fa fa-edit"></i>
                        <span class="hidden sm:inline">Modifier</span>
                    </button>
                    
                    <button class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer bg-purple-600 hover:bg-purple-700 text-white text-sm transition-colors font-medium" 
                            data-action="export"
                            title="Exporter l'agenda">
                        <i class="fa fa-download"></i>
                        <span class="hidden sm:inline">Exporter</span>
                    </button>
                ` : `
                    <button class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer bg-red-600 hover:bg-red-700 text-white text-sm transition-colors font-medium"
                            data-action="leave"
                            title="Quitter cet agenda">
                    <i class="fa fa-sign-out"></i>
                    <span class="hidden sm:inline">Quitter</span>
                    </button>
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
    document.querySelectorAll("[data-action='leave']").forEach(el => {
        el.addEventListener("click", async (e) => {
            
            const confirmed = await showConfirmation(
                "Voulez-vous vraiment quitter cet agenda partagé ?",
                false,
                "Quitter"
            );
            
            if (confirmed.confirmation) {
                let url = `/api/invitations/${e.target.closest("[data-agenda]").dataset.agenda}/leave`;
                try {
                    const response = await fetch(url, {
                        method: "DELETE",
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