/**
 * Affiche une modal de confirmation
 * @param {string} message Le message à afficher
 * @param {string} confirmText Le texte du bouton de confirmation
 * @returns {Promise<boolean>} true si confirmé, false si annulé
 */
async function showConfirmation(message = "Êtes-vous sûr de vouloir continuer ?",isRecurrent, confirmText = "Supprimer") {
    return new Promise((resolve) => {
        // Crée ou réutilise l'overlay de confirmation
        let confirmOverlay = document.getElementById("confirm-overlay");
        
        if (!confirmOverlay) {
            confirmOverlay = document.createElement("div");
            confirmOverlay.id = "confirm-overlay";
            confirmOverlay.className = "fixed w-full h-full top-0 left-0 z-40 bg-slate-900/80 items-center justify-center flex";
            document.body.appendChild(confirmOverlay);
        }

        let recurrenceScript = '';
        if(isRecurrent){
            recurrenceScript= `
            <div class="flex items-center justify-between mb-6" id="contenuCacheReccurence">
                        <div class="flex items-center justify-between mb-6">
                            <label for="modifRec">Modification :</label>
                            <select id="modifRec" name="modifRec" class="border px-3 py-2 rounded">
                                <option value="only" <%= !date_fin_ap ? 'selected' : '' %>Uniquement sur ce rdv</option>
                                <option value="all" <%= date_fin_ap ? 'selected' : '' %>Sur toute la récurrence</option>
                            </select>
                        </div>
                    </div>
            `
        }
        
        // Construit le HTML de la modal
        let modalHTML = `
            <div class="h-fit my-16 mx-auto max-w-md p-6 shadow rounded-xl relative inner-container">
                <h2 class="text-2xl font-bold mb-4">Confirmation</h2>
                <p class="mb-6">${message}</p>
                ${recurrenceScript}
                
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
            let modifRecValue = undefined;
            if(isRecurrent){
                const selectRecursif = confirmOverlay.querySelector("#modifRec");
                if(selectRecursif){
                    modifRecValue = selectRecursif.value;
                }
            }
            confirmOverlay.style.display = "none";
            confirmOverlay.innerHTML = "";
            resolve({confirmation: true, recurrence: modifRecValue});
        });

        // Gère le clic sur "Annuler"
        let cancelBtn = confirmOverlay.querySelector("[data-cancel-confirm]");
        cancelBtn.addEventListener("click", () => {
            confirmOverlay.style.display = "none";
            confirmOverlay.innerHTML = "";
            resolve({confirmation: false, recurrence: undefined});
        });

        // Gère le clic sur le fond
        let handleOverlayClick = (e) => {
            if (e.target === confirmOverlay) {
                confirmOverlay.style.display = "none";
                confirmOverlay.innerHTML = "";
                confirmOverlay.removeEventListener("click", handleOverlayClick);
                resolve({confirmation: false, recurrence: undefined});
            }
        };


        confirmOverlay.addEventListener("click", handleOverlayClick);
    });
}