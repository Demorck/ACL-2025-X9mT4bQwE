/**
 * Génère le HTML d'une carte d'invitation
 */
function renderInvitationCard(invitation) {
    return `
        <div class="invitation-link-card bg-stone-700 hover:bg-stone-600 rounded-lg p-4 transition-colors group"
             data-invitation-id="${invitation._id}">
            
            <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-3 flex-1">
                    <div class="bg-stone-800 px-3 py-1 rounded font-mono text-sm">
                        ...${invitation._id.toString().slice(-8)}
                    </div>
                    
                    <button type="button"
                            class="cursor-pointer copy-link-btn p-2 bg-stone-800 hover:bg-stone-500 rounded transition-colors"
                            data-invitation-id="${invitation._id}"
                            title="Copier le lien">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        
                                <span class="copy-feedback text-green-400 text-xs top-0 left-0 font-bold opacity-0 transition-opacity absolute animate-ping"></span>
                    </button>
                
                </div>
                
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button"
                            class="cursor-pointer edit-invitation-btn p-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                            data-invitation-id="${invitation._id}"
                            title="Modifier">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    
                    <button type="button"
                            class="cursor-pointer delete-invitation-btn p-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                            data-invitation-id="${invitation._id}"
                            title="Supprimer">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span class="text-stone-400">Utilisations :</span>
                    <span class="font-semibold ml-2">${invitation.nbUtilisation} / ${invitation.utilisationsMax || '∞'}</span>
                </div>
                
                <div>
                    <span class="text-stone-400">Expiration :</span>
                    <span class="font-semibold ml-2">
                        ${invitation.dateExpiration ? new Date(invitation.dateExpiration).toLocaleDateString("fr-FR") : 'Jamais'}
                    </span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Génère le HTML d'une carte de membre
 */
function renderMemberCard(invite, agendaId, userNiveau) {
    const roleLabel = invite.niveau === 3 ? 'Admin' : invite.niveau === 2 ? 'Member' : 'Viewer';
    
    return `
        <div class="member-card bg-stone-700 rounded-lg p-3 flex items-center justify-between gap-3 hover:bg-stone-600 transition-colors"
             data-member-id="${invite.user._id}">
            
            <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-10 h-10 rounded-full bg-stone-600 flex items-center justify-center shrink-0">
                    <span class="text-sm font-bold">
                        ${invite.user.username.substring(0, 2).toUpperCase()}
                    </span>
                </div>
                
                <div class="flex-1 min-w-0">
                    <p class="font-semibold truncate">${invite.user.username}</p>
                    <p class="text-xs text-stone-400">${roleLabel}</p>
                </div>
            </div>
            
            ${userNiveau >= 3 ? `
                <div class="flex items-center gap-2 shrink-0">
                    <select class="role-select px-2 py-1 bg-stone-800 hover:bg-stone-900 rounded text-xs border border-stone-600"
                            data-agenda-id="${agendaId}"
                            data-user-id="${invite.user._id}"
                            ${invite.niveau === userNiveau ? 'disabled' : ''}>
                        <option value="3" ${invite.niveau == 3 ? 'selected' : ''}>Admin</option>
                        <option value="2" ${invite.niveau == 2 ? 'selected' : ''}>Member</option>
                        <option value="1" ${invite.niveau == 1 ? 'selected' : ''}>Viewer</option>
                    </select>
                    
                    <button type="button"
                            class="cursor-pointer remove-member-btn p-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                            data-agenda-id="${agendaId}"
                            data-user-id="${invite.user._id}"
                            title="Retirer du groupe">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Recharge les données de gestion des invitations
 */
async function reloadInvitationManagement(agendaId) {
    try {
        const response = await fetch(`/api/invitations/${agendaId}`);
        const result = await response.json();

        if (result.success) {
            updateInvitationLinks(result.invitations || []);
            updateMembers(result.invites || [], agendaId, result.niveau);
        }
    } catch (error) {
        console.error("Erreur lors du rechargement des invitations:", error);
        await creerToast("Erreur lors du rechargement", "echec");
    }
}

/**
 * Met à jour l'affichage des liens d'invitation
 */
function updateInvitationLinks(invitations) {
    const container = document.querySelector('.invitation-links-container');
    
    if (!container) return;

    if (invitations.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-stone-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <p class="text-sm italic">Aucun lien d'invitation actif</p>
                <p class="text-xs mt-1">Créez-en un pour inviter des membres</p>
            </div>
        `;
    } else {
        container.innerHTML = invitations.map(inv => renderInvitationCard(inv)).join('');
    }
}

/**
 * Met à jour l'affichage des membres
 */
function updateMembers(invites, agendaId, userNiveau) {
    const membersList = document.querySelector('.members-list');
    const membersCount = document.querySelector('.members-count');
    
    if (!membersList) return;

    if (membersCount) {
        membersCount.textContent = `Membres (${invites.length})`;
    }

    const membersContainer = membersList.closest('.bg-stone-800');

    if (invites.length === 0) {
        membersContainer.innerHTML = `
            <div class="flex h-full items-center justify-center members-list">
                <div class="text-center text-stone-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p class="text-sm italic">Aucun membre invité</p>
                </div>
            </div>
        `;
    } else {
        membersContainer.innerHTML = `
            <div class="space-y-2 members-list">
                ${invites.map(inv => renderMemberCard(inv, agendaId, userNiveau)).join('')}
            </div>
        `;
    }
}

/**
 * Récupère l'agendaId depuis le DOM
 */
function getAgendaId() {
    const mainContainer = document.querySelector('[data-agenda-id]');
    return mainContainer ? mainContainer.dataset.agendaId : null;
}

/**
 * Gestion globale des événements avec délégation
 */
document.addEventListener("DOMContentLoaded", () => {
    
    // Délégation d'événements sur le document pour tous les clics
    document.addEventListener('click', async (e) => {
        const target = e.target.closest('button, [data-action]');
        if (!target) return;

        // Bouton créer invitation
        if (target.dataset.action === 'create-invitation') {
            const agendaId = target.dataset.agendaId || getAgendaId();
            const html = await fetch(`/invitation/${agendaId}/create`).then(res => res.text());
            const modalContainer = document.querySelector('#modal-container');
            if (modalContainer) modalContainer.innerHTML = html;
        }

        // Copier le lien
        else if (target.classList.contains('copy-link-btn')) {
            const invitationId = target.dataset.invitationId;
            const url = window.location.origin + '/invitation/' + invitationId;
            
            await navigator.clipboard.writeText(url);
            
            const feedback = target.parentElement.querySelector('.copy-feedback');
            if (feedback && feedback.classList.contains('copy-feedback')) {
                feedback.textContent = 'Copié';
                feedback.classList.remove('opacity-0');
                feedback.classList.add('opacity-100');
                
                setTimeout(() => {
                    feedback.classList.remove('opacity-100');
                    feedback.classList.add('opacity-0');
                    setTimeout(() => feedback.textContent = '', 300);
                }, 1000);
            }
        }

        // Modifier invitation
        else if (target.classList.contains('edit-invitation-btn')) {
            const invitationId = target.dataset.invitationId;
            const html = await fetch(`/invitation/${invitationId}/edit`).then(res => res.text());
            const modalContainer = document.querySelector('#modal-container');
            if (modalContainer) modalContainer.innerHTML = html;
        }

        // Supprimer invitation
        else if (target.classList.contains('delete-invitation-btn')) {
            const invitationId = target.dataset.invitationId;
            
            const confirmed = await showConfirmation(
                "Voulez-vous vraiment supprimer ce lien d'invitation ?",
                false,
                "Supprimer"
            );
            
            if (confirmed.confirmation) {
                try {
                    const response = await fetch(`/api/invitations/${invitationId}`, {
                        method: "DELETE"
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        await reloadInvitationManagement(result.agendaId);
                        await creerToast(result.message, "supprimer");
                    } else {
                        await creerToast(result.error, "echec");
                    }
                } catch (error) {
                    console.error("Erreur:", error);
                    await creerToast("Erreur lors de la suppression", "echec");
                }
            }
        }

        // Retirer membre
        else if (target.classList.contains('remove-member-btn')) {
            const confirmed = await showConfirmation(
                "Voulez-vous vraiment retirer ce membre ?",
                false,
                "Retirer"
            );
            
            if (confirmed.confirmation) {
                const agendaId = target.dataset.agendaId;
                const userId = target.dataset.userId;
                
                try {
                    const response = await fetch(`/api/invitations/${agendaId}/members/${userId}`, {
                        method: "DELETE"
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        await reloadInvitationManagement(agendaId);
                        await creerToast(result.message, "supprimer");
                    } else {
                        await creerToast(result.error, "echec");
                    }
                } catch (error) {
                    console.error("Erreur:", error);
                    await creerToast("Erreur lors de la suppression", "echec");
                }
            }
        }
    });

    // Délégation d'événements pour les changements de select
    document.addEventListener('change', async (e) => {
        if (e.target.classList.contains('role-select')) {
            const agendaId = e.target.dataset.agendaId;
            const userId = e.target.dataset.userId;
            const role = e.target.value;
            
            try {
                const response = await fetch(`/api/invitations/${agendaId}/members/${userId}/role`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    await reloadInvitationManagement(agendaId);
                    await creerToast(result.message, "update");
                } else {
                    await creerToast(result.error, "echec");
                    await reloadInvitationManagement(agendaId);
                }
            } catch (error) {
                console.error("Erreur:", error);
                await creerToast("Erreur lors du changement de rôle", "echec");
                await reloadInvitationManagement(agendaId);
            }
        }
    });

    // Intercepter les soumissions de formulaires (création et modification)
    document.addEventListener("submit", async (e) => {
        const form = e.target;
        
        // Création d'invitation
        if (form.action.includes("/invitation/") && form.action.includes("/create")) {
            e.preventDefault();
            
            const agendaId = form.dataset.agenda;
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            try {
                const response = await fetch(`/api/invitations/${agendaId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    document.querySelector("#modal-overlay").classList.add("hidden");
                    document.querySelector("#modal-overlay").classList.remove("flex");
                    document.querySelector("#modal-container").innerHTML = "";
                    
                    await reloadInvitationManagement(agendaId);
                    await creerToast(result.message, "create");
                } else {
                    await creerToast(result.error, "echec");
                }
            } catch (error) {
                console.error("Erreur:", error);
                await creerToast("Erreur lors de la création", "echec");
            }
        }
        
        // Modification d'invitation
        else if (form.action.includes("/invitation/") && form.action.includes("/edit")) {
            e.preventDefault();
            
            const invitationId = form.action.split('/')[2];
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Vérifier si c'est une suppression
            if (e.submitter && e.submitter.textContent.includes("Supprimer")) {
                const confirmed = await showConfirmation(
                    "Voulez-vous vraiment supprimer ce lien d'invitation ?",
                    false,
                    "Supprimer"
                );
                
                if (!confirmed.confirmation) return;
                
                try {
                    const response = await fetch(`/api/invitations/${invitationId}`, {
                        method: "DELETE"
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        document.querySelector("#modal-overlay").classList.add("hidden");
                        document.querySelector("#modal-overlay").classList.remove("flex");
                        document.querySelector("#modal-container").innerHTML = "";
                        
                        await reloadInvitationManagement(result.agendaId);
                        await creerToast(result.message, "supprimer");
                    } else {
                        await creerToast(result.error, "echec");
                    }
                } catch (error) {
                    console.error("Erreur:", error);
                    await creerToast("Erreur lors de la suppression", "echec");
                }
            } else {
                // Modification
                try {
                    const response = await fetch(`/api/invitations/${invitationId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        document.querySelector("#modal-overlay").classList.add("hidden");
                        document.querySelector("#modal-overlay").classList.remove("flex");
                        document.querySelector("#modal-container").innerHTML = "";
                        
                        await reloadInvitationManagement(result.agendaId);
                        await creerToast(result.message, "update");
                    } else {
                        await creerToast(result.error, "echec");
                    }
                } catch (error) {
                    console.error("Erreur:", error);
                    await creerToast("Erreur lors de la modification", "echec");
                }
            }
        }
    });
});