import express from "express";
import { AppointmentModel } from "../../database/appointment.js";
import { listAgendas } from "../../database/agenda.js";

export const routeRecherche = express.Router();

/**
 * Route pour faire la recherche de rendez vous dans la base de donnée
 */
routeRecherche.post("/recherche", async (req, res, next) => {
    try {
      const user = res.locals.user;
      const {str } = req.body;

      // pour avoir les id de tout les agendas
      const agendas = await listAgendas(user);
      const agendaIds = agendas.map(a => a._id);

      const reponse = await rechercheRendezVous(str, agendaIds, next);
      res.json(reponse);
    } catch (error) {
        next(error);
    }
})

/**
 * Fonction qui retourne les rendez-vous correspondant à l'entrée utilisateur
 * @param {entrée saisie par l'utilisateur dans la barre de recherche} str 
 */
async function rechercheRendezVous(str, agendaIds, next) {
  try {
    if(!str) {
      return "";
    } else {
      const appointments = await AppointmentModel.find({
          agenda: { $in: agendaIds },
          nom: { $regex: new RegExp(`^${str}`, 'i') }
      })
      return appointments;
    }
  } catch (error) {
    next(error);
  } 
}