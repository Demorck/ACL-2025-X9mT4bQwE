/**
 * Gestion dynamique des notifications
 */

/**
 * Génère le HTML d'une notification
 */
function renderNotification(notification, user) {
    const concerneEqualConnecte = notification.user_concerned && 
        notification.user_concerned._id.toString() === user._id.toString();
    
    const userText = notification.user_concerned ? 
        (concerneEqualConnecte ? "vous" : notification.user_concerned.username) : 
        "un utilisateur";
    
    const userTextSujet = notification.user_concerned ? 
        (concerneEqualConnecte ? "Vous avez" : `${notification.user_concerned.username} a`) : 
        "Quelqu'un a";

    let message = "";
    switch (notification.type) {
        case 0:
            message = `L'agenda <b>${notification.nom || "?"}</b> a été créé par <b>${userText}</b>.`;
            break;
        case 1:
            message = `Le nouveau rendez-vous <b>${notification.nom || "?"}</b> a été créé par <b>${userText}</b>.`;
            break;
        case 2:
            message = `Le rendez-vous <b>${notification.nom || "?"}</b> a été modifié par <b>${userText}</b>.`;
            break;
        case 3:
            message = `Le rendez-vous <b>${notification.nom || "?"}</b> a été supprimé par <b>${userText}</b>.`;
            break;
        case 4:
            message = `<b>${userTextSujet}</b> été ajouté à l'agenda partagé <b>${notification.nom || "?"}</b>.`;
            break;
        case 5:
            message = `<b>${userTextSujet}</b> été retiré de l'agenda partagé <b>${notification.nom || "?"}</b>.`;
            break;
    }

    return `
        <li class="p-3 rounded flex justify-between items-center group" data-notification-id="${notification._id}">
            <span>${message}</span>
            <div>
                <div class="hidden group-hover:inline-flex gap-4">
                    <div 
                        data-mark-seen="${notification._id}"
                        class="rounded hover:opacity-20 cursor-pointer"
                    >
                        <i class="fa fa-eye"></i> 
                    </div>
                    <div 
                        data-delete-notification="${notification._id}"
                        class="rounded hover:opacity-20 cursor-pointer"
                    >
                        <i class="fa fa-trash"></i> 
                    </div>
                </div>
                ${!notification.seen ? '<span class="text-xs text-red-400 font-semibold">Non lu</span>' : ''}
            </div>
        </li>
    `;
}

/**
 * Recharge toutes les notifications
 */
async function reloadNotifications() {
    try {
        const response = await fetch("/api/notifications");
        const result = await response.json();

        if (result.success) {
            const container = document.querySelector(".w-3\\/4.h-fit.mx-auto");
            let notificationList = container.querySelector("ul.space-y-2");
            let noNotifMessage = container.querySelector(".text-gray-400");
            
            if (result.notifications.length === 0) {
                if (notificationList) notificationList.remove();
                if (!noNotifMessage) {
                    const p = document.createElement("p");
                    p.className = "text-gray-400";
                    p.textContent = "Aucune notification";
                    container.appendChild(p);
                }
            } else {
                if (noNotifMessage) noNotifMessage.remove();
                
                if (!notificationList) {
                    const ul = document.createElement("ul");
                    ul.className = "space-y-2";
                    container.appendChild(ul);
                    notificationList = ul;
                }
                
                notificationList.innerHTML = result.notifications
                    .map(n => renderNotification(n, user))
                    .join("");
            }

            // Met à jour le compteur dans le header
            updateNotificationCount(result.notifications.filter(n => !n.seen).length);
        }
    } catch (error) {
        console.error("Erreur lors du rechargement des notifications:", error);
    }
}

/**
 * Met à jour le compteur de notifications dans le header
 */
function updateNotificationCount(count) {
    const bellLink = document.querySelector('a[href="/notifications"]');
    if (!bellLink) return;
    
    let badge = bellLink.querySelector('.bg-red-600');
    
    if (count > 0) {
        if (badge) {
            badge.textContent = count;
        } else {
            const span = document.createElement("span");
            span.className = "absolute -top-1 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center";
            span.textContent = count;
            bellLink.querySelector('.relative, .md\\:flex').appendChild(span);
        }
    } else {
        if (badge) badge.remove();
    }
}

/**
 * Marque une notification comme vue
 */
async function markNotificationSeen(id) {
    try {
        const response = await fetch(`/api/notifications/${id}/seen`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        const result = await response.json();
        if (result.success) {
            await reloadNotifications();
        }

        // Toast pas erreur
    } catch (error) {
        // TOast Erreur
    }
}

/**
 * Supprime une notification
 */
async function deleteNotification(id) {
    try {
        const response = await fetch(`/api/notifications/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        const result = await response.json();
        if (result.success) {
            await reloadNotifications();
        }

        // Toast pas erreur
    } catch (error) {
        // TOast Erreur
    }
}

/**
 * Marque toutes les notifications comme vues
 */
async function markAllNotificationsSeen() {
    try {
        const response = await fetch("/api/notifications/all/seen", {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        const result = await response.json();
        if (result.success) {
            await reloadNotifications();
        }        

        // Toast pas erreur
    } catch (error) {
        // TOast Erreur
    }
}

/**
 * Supprime toutes les notifications
 */
async function deleteAllNotifications() {
    try {
        const response = await fetch("/api/notifications/all/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        const result = await response.json();
        if (result.success) {
            await reloadNotifications();
        }

        // Toast pas erreur
    } catch (error) {
        // TOast Erreur
    }
}

/**
 * Gestion des événements
 */
document.addEventListener("DOMContentLoaded", () => {
    // Uniquement sur la page des notifications
    if (!window.location.pathname.includes("/notifications")) return;

    // Intercepter les clics sur les boutons
    document.addEventListener("click", async (e) => {
        // Marquer comme vue
        if (e.target.closest("[data-mark-seen]")) {
            e.preventDefault();
            const id = e.target.closest("[data-mark-seen]").dataset.markSeen;
            await markNotificationSeen(id);
        }

        // Supprimer une notification
        if (e.target.closest("[data-delete-notification]")) {
            e.preventDefault();
            const id = e.target.closest("[data-delete-notification]").dataset.deleteNotification;
            await deleteNotification(id);
        }

        // Supprimer une notification
        if (e.target.closest("[data-mark-all-seen]")) {
            e.preventDefault();
            await markAllNotificationsSeen();
        }

        // Supprimer une notification
        if (e.target.closest("[data-delete-all]")) {
            e.preventDefault();
            await deleteAllNotifications();
        }
    });
});