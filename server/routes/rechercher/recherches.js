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
 * @param {Id des agendas dans laquel la recherche est faite} agendaIds
 * @param {*} next
 * @returns une liste de rdv (à afficher).
 */
async function rechercheRendezVous(str, agendaIds, next) {
  try {
    if (!str)
      return []; 

    const appointments = await AppointmentModel.find({
        agenda: { $in: agendaIds },
        nom: { $regex: new RegExp(`^${str}`, 'i') }
    }).populate('recurrenceRule'); 

    const resultatsFinaux = [];
    const dateMax = new Date();
    dateMax.setFullYear(dateMax.getFullYear() + 1);

    for(let rdv of appointments) {
      let rdvOriginal = rdv.toObject();
      // Si pas de récurrence
      if(!rdv.recurrenceRule) {
          resultatsFinaux.push(rdvOriginal);
          continue; 
      }
      // Si récurrence
      const regle = rdv.recurrenceRule;
      const dureeMs = new Date(rdv.date_Fin).getTime() - new Date(rdv.date_Debut).getTime();
      
      let dateDebutReccurence = new Date(rdv.date_Debut);
      let dateFinRecurrence = regle.date_fin ? new Date(regle.date_fin) : dateMax;
      let intervalle = parseInt(regle.intervale);
      if (isNaN(intervalle) || intervalle < 1) intervalle = 1;
      while(dateDebutReccurence <= dateFinRecurrence) {
        resultatsFinaux.push({
            ...rdvOriginal, 
            date_Debut: new Date(dateDebutReccurence), 
            date_Fin: new Date(dateDebutReccurence.getTime() + dureeMs)
        });
        switch(regle.frequence) {
          case 'day1':
            dateDebutReccurence.setDate(dateDebutReccurence.getDate() + intervalle);
            break;
          case 'week1':
            dateDebutReccurence.setDate(dateDebutReccurence.getDate() + (7 * intervalle));
            break;
          case 'month1':
            dateDebutReccurence.setMonth(dateDebutReccurence.getMonth() + intervalle);
            break;
          case 'year1':
            dateDebutReccurence.setFullYear(dateDebutReccurence.getFullYear() + intervalle);
            break;
          default:
            break;
        }
      }
    }
    resultatsFinaux.sort((a, b) => a.date_Debut - b.date_Debut);
    return resultatsFinaux;
  } catch (error) {
    next(error);
  } 
}