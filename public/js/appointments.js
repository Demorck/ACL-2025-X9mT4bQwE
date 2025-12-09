document.addEventListener('DOMContentLoaded', function() {
    console.log("Ici");
        const modifRecSelect = document.getElementById('modifRec');

        // On applique cette logique uniquement si le menu déroulant existe et que l'utilisateur a les droits de base (niveau >= 2)
        if (modifRecSelect) {
            const dateInputs = [
                document.getElementById('date_debut'),
                document.getElementById('heure_debut'),
                document.getElementById('date_fin'),
                document.getElementById('heure_fin')
            ];

            function handleRecurrenceChange() {
                const disableDates = modifRecSelect.value === 'only';
                dateInputs.forEach(input => {
                    input.disabled = disableDates;
                });
            }

            // Ajouter l'écouteur d'événement
            modifRecSelect.addEventListener('change', handleRecurrenceChange);

            // Exécuter la fonction au chargement pour définir l'état initial correct
            handleRecurrenceChange();
        }
    });


document.addEventListener("change", function (e) {
    if (e.target.id === "recurrence") {
        const contenuCache = document.getElementById("contenuCache");
        updateSelectOptions();
        if (!contenuCache) return;

        contenuCache.style.display = e.target.checked ? "block" : "none";
    } else if (e.target.id === "date_debut") {
        updateDateFinRecurrence(); 
        updateDateFin();
    } else if (e.target.id === "heure_debut") {
        updateHeureFin();
    }
});

document.addEventListener("blur", function (e) {
    if (e.target.id === "date_fin") {
        validiteDateFin();
    } else if (e.target.id === "heure_fin") {
        console.log("Heure de début changed");
        updateHeureFin();
    }
});


document.addEventListener("change", function (e) {
    if (e.target.id === "fin_rec") {
        afficherCalendar();
    }
});






//permet de vérifier si la date de fin est antérieur à la date de debut
function validiteDateFin(){
    let dateDebAppointment = document.getElementById('date_debut');
    let dateFinAppointment = document.getElementById('date_fin');

    const valueDateDeb = dateDebAppointment.value;
    const valueDateFin = dateFinAppointment.value;

    if(valueDateFin && valueDateDeb && valueDateFin < valueDateDeb){
        dateFinAppointment.value = valueDateDeb;
    }
}


//permet de changer la date de fin en fonction de la date de debut
function updateDateFin(){
    let dateDebAppointment = document.getElementById('date_debut');
    let dateFinAppointment = document.getElementById('date_fin');

    const valueDateDeb = dateDebAppointment.value;

    if(valueDateDeb){
        dateFinAppointment.setAttribute('min', valueDateDeb);
    }else {
        dateFinAppointment.removeAttribute('min');
    }
    validiteDateFin();

}

// Permet de ne pas avoir d'heure de fin antérieur à l'heure de début (sur le même jour)
function updateHeureFin() {
    // Même jour
    let dateDebAppointment = document.getElementById('date_debut');
    let dateFinAppointment = document.getElementById('date_fin');
    let heureDebut = document.getElementById('heure_debut');
    let heureFin = document.getElementById('heure_fin');
    
    if (dateDebAppointment.value === dateFinAppointment.value) {
        if (heureDebut.value > heureFin.value)
            heureFin.value = heureDebut.value;
    }
}

//permet de mettre à jour la date 
function updateDateFinRecurrence() {
    const dateDebInput = document.getElementById('date_debut');
    const dateFinRecInput = document.getElementById('date_fin_rec');

    if (!dateFinRecInput) {
        return; 
    }
    const valueDateDeb = dateDebInput.value;

    if (!dateFinRecInput.value && valueDateDeb) {
        dateFinRecInput.value = valueDateDeb;
    }

    if (valueDateDeb) {
        dateFinRecInput.setAttribute('min', valueDateDeb);
    } else {
        dateFinRecInput.removeAttribute('min');
    }

    const valueDateFinRec = dateFinRecInput.value;

    if (valueDateFinRec && valueDateDeb && valueDateFinRec < valueDateDeb) {
        dateFinRecInput.value = valueDateDeb;
    }
}


function afficherCalendar(){
    const selectionSpecialDate = document.getElementById('fin_rec');
    const contenuCacheDateFin = document.getElementById('contenuCacheDateFin');
    const dateFinRecInput = document.getElementById('date_fin_rec');

    if (!selectionSpecialDate || !contenuCacheDateFin || !dateFinRecInput) return;

    if(selectionSpecialDate.value == 'specificalDate'){
        contenuCacheDateFin.style.display = 'block';
        dateFinRecInput.required = true;
        updateDateFinRecurrence();
    }else{
        contenuCacheDateFin.style.display = 'none';
        dateFinRecInput.required = false;
    }
}

function updateSelectOptions() {
    /* const checkbox = document.getElementById('recurrence');
    const select = document.getElementById('modifRec');
    const optionOnly = document.getElementById('optionOnly');

    if (!checkbox || !select || !optionOnly) return;

    if (checkbox.checked) {
        optionOnly.disabled = false;
        optionOnly.hidden = false;
    } else {
        optionOnly.disabled = true;
        optionOnly.hidden = true;
        select.value = "only";
    } */
}

    


