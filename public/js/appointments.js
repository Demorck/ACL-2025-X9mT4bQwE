document.addEventListener("change", function (e) {
    if (e.target.id === "recurrence") {
        const contenuCache = document.getElementById("contenuCache");
        if (!contenuCache) return;

        contenuCache.style.display = e.target.checked ? "block" : "none";
    } else if (e.target.id === "date_debut") {
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

function afficherCalendar(){
    const selectionSpecialDate = document.getElementById('fin_rec');
    const contenuCacheDateFin = document.getElementById('contenuCacheDateFin');
    const dateFinRecInput = document.getElementById('date_fin_rec');

    if (!selectionSpecialDate || !contenuCacheDateFin || !dateFinRecInput) return;

    if(selectionSpecialDate.value == 'specificalDate'){
        contenuCacheDateFin.style.display = 'block';
        dateFinRecInput.required = true;
    }else{
        contenuCacheDateFin.style.display = 'none';
        dateFinRecInput.required = false;
    }
}