import { getAppointmentsForDay } from "../database/appointment.js";

/**
 *  Génère les données des 24 heures d'une journée.
 * 
 * @param {Number} year L'année (4 chiffres)
 * @param {Number} month Le mois (2 chiffres de 0 à 11)
 * @param {Number} day Le jour (2 chiffres de 0 à 30) 
 * @return {Array} Un tableau contenant les heures de la journée
 */
export async function getDailyData(year, month, day, agenda)
{
    const hours = Array.from({length: 24}, () => []);

    const today = new Date(year,month,day);

    //Récupère les appointments d'un user (normalement)
    //Pour le moment récupère tous les appointments qu'il trouve et les affiche
    const appointments = await getAppointmentsForDay(today,agenda);

    // On définit le début et la fin de la journée pour des comparaisons précises
    const startOfToday = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    const endOfToday = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

    appointments.forEach(appointment => {
        // Si le RDV commence avant aujourd'hui, son heure de début pour l'affichage est 0h
        const heure_debut = appointment.date_Debut.getUTCHours() < startOfToday.getUTCHours() ? 0 : appointment.date_Debut.getUTCHours();
        // Si le RDV se termine après aujourd'hui, son heure de fin pour l'affichage est 23h
        const heure_fin = appointment.date_Fin.getUTCHours() > endOfToday.getUTCHours() ? 23 : (appointment.date_Fin.getMinutes() > 0 ? appointment.date_Fin.getUTCHours() : appointment.date_Fin.getUTCHours()-1); //Si les minutes sont à 00 alors on exclut la dernière heure
        
        for(let h = heure_debut; h <= heure_fin; h++)
        {
            hours[h].push(appointment);
        }
    });

    // console.log(hours);

  return hours;
}
