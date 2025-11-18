document.addEventListener("change", function (e) {
    if (e.target.id === "recurrence") {
        const contenuCache = document.getElementById("contenuCache");
        if (!contenuCache) return;

        contenuCache.style.display = e.target.checked ? "block" : "none";
    }
});

document.addEventListener("change", function (e) {
    if (e.target.id === "fin_rec") {
        afficherCalendar();
    }
});

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