/**
 * Affiche une modal de confirmation
 * @param {string} message Le message à afficher
 * @param {string} confirmText Le texte du bouton de confirmation
 * @returns {Promise<boolean>} true si confirmé, false si annulé
 */
async function showConfirmation(message = "Êtes-vous sûr de vouloir continuer ?", confirmText = "Supprimer") {
    return new Promise((resolve) => {
        // Crée ou réutilise l'overlay de confirmation
        let confirmOverlay = document.getElementById("confirm-overlay");
        
        if (!confirmOverlay) {
            confirmOverlay = document.createElement("div");
            confirmOverlay.id = "confirm-overlay";
            confirmOverlay.className = "fixed w-full h-full top-0 left-0 z-40 bg-slate-900/80 items-center justify-center flex";
            document.body.appendChild(confirmOverlay);
        }
        
        // Construit le HTML de la modal
        let modalHTML = `
            <div class="h-fit my-16 mx-auto max-w-md p-6 shadow rounded-xl relative inner-container">
                <h2 class="text-2xl font-bold mb-4">Confirmation</h2>
                <p class="mb-6">${message}</p>
                
                <div class="flex gap-4 justify-end">
                    <button 
                        type="button" 
                        data-cancel-confirm
                        class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer"
                    >
                        Annuler
                    </button>
                    <button 
                        type="button" 
                        data-confirm-action
                        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                    >
                        ${confirmText}
                    </button>
                </div>
            </div>
        `;

        // Afficher la modal
        confirmOverlay.innerHTML = modalHTML;
        confirmOverlay.style.display = "flex";

        // Gère le clic sur "Confirmer"
        let confirmBtn = confirmOverlay.querySelector("[data-confirm-action]");
        confirmBtn.addEventListener("click", () => {
            confirmOverlay.style.display = "none";
            confirmOverlay.innerHTML = "";
            resolve(true);
        });

        // Gère le clic sur "Annuler"
        let cancelBtn = confirmOverlay.querySelector("[data-cancel-confirm]");
        cancelBtn.addEventListener("click", () => {
            confirmOverlay.style.display = "none";
            confirmOverlay.innerHTML = "";
            resolve(false);
        });

        // Gère le clic sur le fond
        let handleOverlayClick = (e) => {
            if (e.target === confirmOverlay) {
                confirmOverlay.style.display = "none";
                confirmOverlay.innerHTML = "";
                confirmOverlay.removeEventListener("click", handleOverlayClick);
                resolve(false);
            }
        };


        confirmOverlay.addEventListener("click", handleOverlayClick);
    });
}