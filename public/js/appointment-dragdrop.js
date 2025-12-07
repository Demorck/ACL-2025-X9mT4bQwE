/**
 * Gestion du drag & drop pour les rendez-vous
 */

let draggedAppointment = null;
let draggedElement = null;
let ghostElement = null;
let originalPosition = null;
let currentDropZone = null;
let lastSnapZone = null;
let isDragging = false;


/**
 * Initialise le drag & drop sur tous les rendez-vous
 */
function initDragDrop() {
    let view = document.querySelector('#container-filter')?.dataset.view;
    
    // Le drag & drop n'est disponible que pour les vues jour et semaine
    if (view !== "day" && view !== "week") return;

    document.querySelectorAll("[data-appointment]").forEach(appointmentEl => {
        appointmentEl.draggable = true;
        appointmentEl.style.cursor = "grab";
        
        appointmentEl.addEventListener("dragstart", handleDragStart);
        appointmentEl.addEventListener("dragend", handleDragEnd);
        
        // Empêcher le clic de déclencher l'édition pendant le drag
        appointmentEl.addEventListener("click", (e) => {
            if (isDragging) {
                e.stopPropagation();
                e.preventDefault();
            }
        }, true);
    });

    // Zones de drop (les cases horaires)
    document.querySelectorAll("[data-open-appointment]").forEach(dropZone => {
        dropZone.addEventListener("dragover", handleDragOver);
        dropZone.addEventListener("drop", handleDrop);
        dropZone.addEventListener("dragleave", handleDragLeave);
        dropZone.addEventListener("dragenter", handleDragEnter);
    });
}

/**
 * Début du drag
 */
function handleDragStart(e) {
    isDragging = true;
    draggedElement = e.target.closest("[data-appointment]");
    
    if (!draggedElement) {
        console.error("Element not found");
        return;
    }
    
    // Récupérer toutes les infos du rendez-vous
    // Si c'est sur plusieurs jours, on fait le total
    let allSegments = document.querySelectorAll(`[data-id="${draggedElement.dataset.id}"]`);
    let totalDuration = 0;
    allSegments.forEach(seg => {
        totalDuration += parseFloat(seg.dataset.duration);
    });
    
    draggedAppointment = {
        id: draggedElement.dataset.id,
        agendaId: draggedElement.dataset.agenda,
        day: parseInt(draggedElement.dataset.day),
        month: parseInt(draggedElement.dataset.month),
        year: parseInt(draggedElement.dataset.year),
        startHour: parseFloat(draggedElement.dataset.start),
        duration: totalDuration,
        nom: draggedElement.querySelector('strong')?.textContent || 'Rendez-vous',
        color: Array.from(draggedElement.classList).find(c => c.startsWith('appointment-color-'))?.replace('appointment-color-', '') || 'white',
        isRecurrent: draggedElement.dataset.recurrent === 'true' || false
    };

    originalPosition = {
        day: draggedAppointment.day,
        month: draggedAppointment.month,
        year: draggedAppointment.year,
        startHour: draggedAppointment.startHour
    };

    draggedElement.style.cursor = "grabbing";
    
    // "Masquer" l'élément original pendant le drag
    setTimeout(() => {
        if (draggedElement) {
            draggedElement.style.opacity = "0.2";
            draggedElement.style.pointerEvents = "none";
        }
    }, 0);

    e.dataTransfer.effectAllowed = "move";
    
    // On définit des données pour que le drag fonctionne (du coup, si on drag autre part genre l'IDE, ça va nous copier l'ID)
    e.dataTransfer.setData('text/plain', draggedAppointment.id);
}

/**
 * Crée l'élément fantôme qui se snap sur les heures
 */
function createOrUpdateGhost(dropZone) {
    if (!draggedAppointment) return;
    
    let view = document.querySelector('#container-filter')?.dataset.view;
    let newDay = parseInt(dropZone.dataset.day);
    let newMonth = parseInt(dropZone.dataset.month);
    let newYear = parseInt(dropZone.dataset.year);
    let newStartHour = parseInt(dropZone.dataset.hour || 0);
    
    // Trouver le container parent (colonne du jour)
    let container;
    if (view === "day") {
        container = document.querySelector('.calendar-hours-background, .calendar-hours-background-today');
    } else if (view === "week") {
        container = dropZone.closest('.flex-1.relative.border-r');
    }
    
    if (!container) {
        console.error("Container not found");
        return;
    }
    
    if (ghostElement) {
        ghostElement.remove();
    }
    
    // Créer le nouvel élément fantôme
    ghostElement = document.createElement('div');
    ghostElement.className = `appointment appointment-color-${draggedAppointment.color} appointment-ghost`;
    ghostElement.style.position = 'absolute';
    ghostElement.style.pointerEvents = 'none';
    ghostElement.style.zIndex = '9999';
    ghostElement.style.opacity = '0.8';
    ghostElement.style.left = '0';
    ghostElement.style.width = '100%';
    
    // Calculer la position et la hauteur
    let topPercent = (newStartHour / 24) * 100;
    let heightPercent = (draggedAppointment.duration / 24) * 100;
    
    ghostElement.style.top = `calc(${topPercent}%)`;
    ghostElement.style.height = `calc(${heightPercent}%)`;
    
    let endHour = newStartHour + draggedAppointment.duration;
    let startLabel = formatHourMinute(newStartHour);
    let endLabel = formatHourMinute(endHour);
    
    ghostElement.innerHTML = `
        <strong>${draggedAppointment.nom}</strong><br>
        ${startLabel} - ${endLabel}
    `;
    
    container.appendChild(ghostElement);
}

/**
 * Formate l'heure en HH:MM
 */
function formatHourMinute(decimalHour) {
    let hours = Math.floor(decimalHour);
    let minutes = Math.round((decimalHour % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Confirmation spécifique pour les rendez-vous récurrents
 * @returns {Promise<boolean|null>} true = toutes les occurrences, false = une seule, null = annulé
 */
async function showRecurrentConfirmation() {
    return new Promise((resolve) => {
        let confirmOverlay = document.getElementById("recurrent-confirm-overlay");
        
        if (!confirmOverlay) {
            confirmOverlay = document.createElement("div");
            confirmOverlay.id = "recurrent-confirm-overlay";
            confirmOverlay.className = "fixed w-full h-full top-0 left-0 z-40 bg-slate-900/80 items-center justify-center flex";
            document.body.appendChild(confirmOverlay);
        }

        // Pour le moment
        let modalHTML = `
            <div class="h-fit my-16 mx-auto max-w-md p-6 shadow rounded-xl relative inner-container">
                <h2 class="text-2xl font-bold mb-4">Rendez-vous récurrent</h2>
                <p class="mb-6">Ce rendez-vous est récurrent. Voulez-vous modifier :</p>
                
                <div class="flex flex-col gap-3">
                    <button 
                        type="button" 
                        data-confirm-single
                        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                    >
                        Seulement cette occurrence
                    </button>
                    <button 
                        type="button" 
                        data-confirm-all
                        class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 cursor-pointer"
                    >
                        Toutes les occurrences
                    </button>
                    <button 
                        type="button" 
                        data-cancel-recurrent
                        class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        `;

        confirmOverlay.innerHTML = modalHTML;
        confirmOverlay.style.display = "flex";

        // Gérer le clic sur "Une seule occurrence"
        let singleBtn = confirmOverlay.querySelector("[data-confirm-single]");
        singleBtn.addEventListener("click", () => {
            confirmOverlay.style.display = "none";
            confirmOverlay.innerHTML = "";
            resolve(false);
        });

        // Gérer le clic sur "Toutes les occurrences"
        let allBtn = confirmOverlay.querySelector("[data-confirm-all]");
        allBtn.addEventListener("click", () => {
            confirmOverlay.style.display = "none";
            confirmOverlay.innerHTML = "";
            resolve(true);
        });

        // Gérer le clic sur "Annuler"
        let cancelBtn = confirmOverlay.querySelector("[data-cancel-recurrent]");
        cancelBtn.addEventListener("click", () => {
            confirmOverlay.style.display = "none";
            confirmOverlay.innerHTML = "";
            resolve(null);
        });

        // Gérer le clic sur l'overlay (fond)
        let handleOverlayClick = (e) => {
            if (e.target === confirmOverlay) {
                confirmOverlay.style.display = "none";
                confirmOverlay.innerHTML = "";
                confirmOverlay.removeEventListener("click", handleOverlayClick);
                resolve(null);
            }
        };


        confirmOverlay.addEventListener("click", handleOverlayClick);
    });
}

/**
 * Fin du drag
 */
function handleDragEnd(e) {
    setTimeout(() => {
        isDragging = false;
    }, 100);
    
    if (draggedElement) {
        draggedElement.style.cursor = "grab";
        draggedElement.style.opacity = "1";
        draggedElement.style.pointerEvents = "auto";
    }
    
    if (ghostElement) {
        ghostElement.remove();
        ghostElement = null;
    }
    
    document.querySelectorAll("[data-open-appointment]").forEach(zone => {
        zone.classList.remove("drop-zone-active", "drop-zone-hover");
    });
    
    currentDropZone = null;
    lastSnapZone = null;
    draggedAppointment = null;
    draggedElement = null;
}

/**
 * Entrée dans une zone de drop
 */
function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isDragging || !draggedAppointment) return;
    
    let dropZone = e.currentTarget;
    
    // Ne créer le fantôme que si on change de zone horaire
    let zoneKey = `${dropZone.dataset.day}-${dropZone.dataset.month}-${dropZone.dataset.year}-${dropZone.dataset.hour}`;
    
    if (lastSnapZone !== zoneKey) {
        lastSnapZone = zoneKey;
        createOrUpdateGhost(dropZone);
        document.querySelectorAll("[data-open-appointment]").forEach(z => {
            z.classList.remove("drop-zone-hover");
        });
        dropZone.classList.add("drop-zone-hover");
    }
    
    currentDropZone = dropZone;
}

/**
 * Survol d'une zone de drop
 */
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isDragging) return;

    e.dataTransfer.dropEffect = "move";
    return false;
}

/**
 * Sortie d'une zone de drop
 */
function handleDragLeave(e) {
    // Pas besoin de gérer, on update sur dragenter
}

/**
 * Drop du rendez-vous
 */
async function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedAppointment) return;

    let dropZone = e.currentTarget;
    let newDay = parseInt(dropZone.dataset.day);
    let newMonth = parseInt(dropZone.dataset.month);
    let newYear = parseInt(dropZone.dataset.year);
    let newStartHour = parseInt(dropZone.dataset.hour || 0);

    // Retirer le highlight
    dropZone.classList.remove("drop-zone-hover");

    // Calculer les nouvelles dates
    let oldStartDate = new Date(
        draggedAppointment.year,
        draggedAppointment.month,
        draggedAppointment.day,
        Math.floor(draggedAppointment.startHour),
        (draggedAppointment.startHour % 1) * 60
    );

    let newStartDate = new Date(
        newYear,
        newMonth,
        newDay,
        newStartHour,
        (draggedAppointment.startHour % 1) * 60 
    );

    let newEndDate = new Date(newStartDate.getTime() + (draggedAppointment.duration * 60 * 60 * 1000));

    // si le rendez-vous a vraiment bougé
    let hasMoved = newDay !== originalPosition.day || 
                     newMonth !== originalPosition.month || 
                     newYear !== originalPosition.year || 
                     newStartHour !== Math.floor(originalPosition.startHour);

    if (!hasMoved) {
        return;
    }

    // Si c'est un rendez-vous récurrent, demander si on modifie une occurrence ou toutes
    let modifyAllOccurrences = false;
    if (draggedAppointment.isRecurrent) {
        let recurrentChoice = await showRecurrentConfirmation();
        if (recurrentChoice === null) {
            if (draggedElement) {
                draggedElement.style.opacity = "1";
                draggedElement.style.pointerEvents = "auto";
            }
            return;
        }
        modifyAllOccurrences = recurrentChoice;
    }

    // Demander confirmation du déplacement
    // let confirmed = await showConfirmation(
    //     `Déplacer ${modifyAllOccurrences ? 'toutes les occurrences du' : 'ce'} rendez-vous au ${newStartDate.toLocaleDateString('fr-FR')} à ${newStartDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} ?`,
    //     "Déplacer"
    // );

    if (true) {
        await updateAppointmentDateTime(
            draggedAppointment.id,
            draggedAppointment.agendaId,
            newStartDate,
            newEndDate,
            newDay,
            newMonth,
            newYear,
            modifyAllOccurrences
        );
    } else {
        if (draggedElement) {
            draggedElement.style.opacity = "1";
            draggedElement.style.pointerEvents = "auto";
        }
    }
}

/**
 * Met à jour la date/heure d'un rendez-vous
 */
async function updateAppointmentDateTime(appointmentId, agendaId, startDate, endDate, day, month, year, modifyAllOccurrences = false) {
    try {
        // Formater les dates pour l'API
        let formatDate = (date) => {
            let y = date.getFullYear();
            let m = String(date.getMonth() + 1).padStart(2, '0');
            let d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        let formatTime = (date) => {
            let h = String(date.getHours()).padStart(2, '0');
            let m = String(date.getMinutes()).padStart(2, '0');
            return `${h}:${m}`;
        };

        let data = {
            id: appointmentId,
            agendas: agendaId,
            date_debut: formatDate(startDate),
            heure_debut: formatTime(startDate),
            date_fin: formatDate(endDate),
            heure_fin: formatTime(endDate),
            day: day,
            month: month,
            year: year,
            modifyAllOccurrences: modifyAllOccurrences
        };

        let response = await fetch(`/api/appointments/${appointmentId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        let result = await response.json();

        if (result.success) {
            if (typeof reloadCurrentCalendarView === 'function') {
                await reloadCurrentCalendarView();
            }
            
            await creerToast(result.message, "update");
        } else {
            await creerToast(result.error, "error");
            if (draggedElement) {
                draggedElement.style.opacity = "1";
                draggedElement.style.pointerEvents = "auto";
            }
        }
    } catch (error) {
        await creerToast(result.error, "error");
        if (draggedElement) {
            draggedElement.style.opacity = "1";
            draggedElement.style.pointerEvents = "auto";
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initDragDrop();
});

window.initDragDrop = initDragDrop;