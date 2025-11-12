import { AppointmentModel } from "../../database/appointment.js";

/**
 * Route pour faire la recherche de rendez vous dans la base de donnée
 */
routeRecherche.post("/api/rechercher/recherche", (req, res, next) => {
    try {
        const {str, agendaId } = req.body;
        const reponse = rechercheRendezVous(str, agendaId, next);
        res.json(reponse);
    } catch (error) {
        next(error);
    }
})

/**
 * Fonction qui retourne les rendez-vous correspondant à l'entrée utilisateur
 * @param {entrée saisie par l'utilisateur dans la barre de recherche} str 
 */
async function rechercheRendezVous(str, agendaId, next) {
  try {
    const appointments = await AppointmentModel.find({
        agenda: { $in: agendaId },
        nom: { $regex: new RegExp(`^${str}`, 'i') }
    })
    return appointments;
  } catch (error) {
    next(error);
  } 
}