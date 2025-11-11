/**
 * Route pour faire la recherche de rendez vous dans la base de donnée
 */
routeRecherche.post("/api/recherche", (req, res, next) => {
    let str = req.body;
    rechercheRendezVous(str);
})

/**
 * Fonction qui retourne les rendez-vous correspondant à l'entrée utilisateur
 * @param {entrée saisie par l'utilisateur dans la barre de recherche} str 
 */
async function rechercheRendezVous(str) {
    
}