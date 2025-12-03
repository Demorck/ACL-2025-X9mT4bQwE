/**
 * Gestion dynamique des rendez-vous (ajout/modification/suppression)
 */

/**
 * Soumet un formulaire de rendez-vous
 */
async function submitAppointmentForm(form, action) {
    console.log("non je ny crois pas");
    let formData = new FormData(form);
    let data = Object.fromEntries(formData.entries());

    let url = "/api/appointments";
    let method = "POST";

    if (action === "update") {
        url = `/api/appointments/${data.id}`;
        method = "PUT";
    } else if (action === "delete") {
        url = `/api/appointments/${data.id}`;
        method = "DELETE";
    }

    try {
        let response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        let result = await response.json();

        if (result.success) {
            // Ferme le modal
            document.querySelector("#modal-overlay").classList.add("hidden");
            document.querySelector("#modal-overlay").classList.remove("flex");
            document.querySelector("#modal-container").innerHTML = "";

            // Recharge la vue actuelle du calendrier
            await reloadCurrentCalendarView();

            let type = "succes";
            if(result.appointment === undefined) {
                type = "supprimer";
            }
            await creerToast(result.message, type);
        } else {
            await creerToast(result.error, "echec");
        }
    } catch (error) {
        // Toast erreur 
        await creerToast(error, "echec");
    }
}

/**
 * Recharge la vue actuelle du calendrier
 */
async function reloadCurrentCalendarView() {
    let pathParts = window.location.pathname.split('/');
    let view = pathParts[2] || 'week';
    let params = {};
    
    new URLSearchParams(window.location.search).forEach((value, key) => {
        params[key] = value;
    });

    // Utilise les fonctions existantes de dynamic.js
    // Les typeof vérifient que les fonctions existent (au cas où les fichiers ne sont pas chargés dans le bon ordre, ça m'est arrivé)
    if (typeof loadCalendarData === 'function' && typeof updateCalendarDisplay === 'function') {
        let calendarData = await loadCalendarData(view, params);
        if (calendarData) {
            updateCalendarDisplay(calendarData);
        }
    }
}

/**
 * Intercepte la soumission des formulaires de rendez-vous
 */
document.addEventListener("submit", async (e) => {
    let form = e.target;
    
    if (form.action.includes("/appointment/add") || 
        form.action.includes("/appointment/update")) {
        
        e.preventDefault();

        let action = form.action.includes("/add") ? "create" : "update";
        
        // Demander confirmation si on veut supprimer, pour le moment existe pas mais ça sera ici pour après
        let submitter = e.submitter;
        if (submitter && submitter.name === "actionType" && submitter.value === "Supprimer") {
            await submitAppointmentForm(form, "delete");
        } else {
            await submitAppointmentForm(form, action);
        }
    }
});