/**
 * Gère les confirmations de suppression pour tous les formulaires
 */
const deleteMessages = {
    appointment: "Voulez-vous vraiment supprimer ce rendez-vous ?",
    agenda: "Voulez-vous vraiment supprimer cet agenda ?",
    notification: "Voulez-vous vraiment supprimer cette notification ?",
    default: "Voulez-vous vraiment supprimer LE SITE INTERNET ?"
};

document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", async (e) => {
        const deleteBtn = e.target.closest("[data-delete-action]");
        if (!deleteBtn) return;

        e.preventDefault();

        const actionType = deleteBtn.dataset.deleteAction;
        const recurrence = deleteBtn.dataset.isRecurrent;
        const isRecurrent = recurrence === 'true';
        const message = deleteMessages[actionType] || deleteMessages.default;

        // Affiche la modal confirmation
        const resultatConfirmation = await showConfirmation(message, isRecurrent, "Supprimer");
        const confirmed = resultatConfirmation.confirmation;
        const modificationRec = resultatConfirmation.recurrence;

        if (confirmed) {
            // Trouve le formulaire parent et le soumet
            const form = deleteBtn.closest("form");
            if (form) {
                // Crée un input hidden pour indiquer l'action de suppression (car les routes utilisent ça)
                const actionInput = document.createElement("input");
                actionInput.type = "hidden";
                actionInput.name = "actionType";
                actionInput.value = "Supprimer";
                form.appendChild(actionInput);

                if(modificationRec){
                    // Crée un input hidden pour indiquer la modification d'un rdv recurrent que l'on souhaite
                    const modifRecurrence = document.createElement("input");
                    modifRecurrence.type = "hidden";
                    modifRecurrence.name = "modifRecSup";
                    modifRecurrence.value = modificationRec;
                    form.appendChild(modifRecurrence);
                }

                form.submit();
            }
        }
    });
});