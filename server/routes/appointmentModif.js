import { AgendaModel, getAgendasForUser } from "../database/agenda.js";
import { AppointmentModel } from "../database/appointment.js";
import { toLocalDateHours } from "../utils/date.js";
import { creerNotification } from "../database/notification.js";

/**
 * Fonction qui permet l'affichage du rdv que l'on souhaite modifier
 * @param {*} req 
 * @param {*} res 
 */
export async function routeModif(req, res) {
    const {id, day, month, year, agendaId} = req.body;

    const appointment = await AppointmentModel.findById(id);
    
    const agenda = AgendaModel.findById(agendaId);
    const agendaName = agenda.nom;

    const validAgendas = await getAgendasForUser(res.locals.user)

    if (appointment) {
        res.render('calendar/modifAppointment', {
            rendezVous: appointment,
            agendaName: agendaName,
            day: day,
            month: month,
            year: year,
            agendas: validAgendas,
        });
    } else {
        res.status(404).send("Rendez-vous introuvable");
    }
}

/**
 * Fonction qui supprime le rendez-vous selectionné
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export async function routeDelete(req,res, next){
    try{
        const {id, day, month, year, agendaId} = req.body;

        if(id === null)
        {
            return res.status(400).send("Rendez-vous introuvable");
        }

        const userAgenda = await AgendaModel.findById(agendaId).populate('user');
        const userObject = userAgenda.user._id;

        if(res.locals.user._id.toString() != userObject.toString()){
            return res.status(400).send("Ce rendez-vous ne vous appartient pas");
        }

        // Sauvegarde la notification de suppression dans la base de données
        await creerNotification(userAgenda.user, id, undefined, 3);

        // Supprime le rendez-vous
        await AppointmentModel.findByIdAndDelete(id); 


        res.redirect(`/daily?day=${day}&month=${month}&year=${year}`);
    } catch(error){
        next(error);
    }
}

/**
 * Fonction qui modifie la base de données avec les modifications du rendez-vous en question
 * @param {*} req 
 * @param {*} res 
 */
export async function routeAddModif(req,res, next){
    try{
        const {id, nom, date_debut, heure_debut, date_fin, heure_fin, day, month, year, agendas} = req.body;

        const startDateTime = toLocalDateHours(date_debut, parseInt(heure_debut.split(":")[0]), parseInt(heure_debut.split(":")[1]));
        const endDateTime = toLocalDateHours(date_fin, parseInt(heure_fin.split(":")[0]), parseInt(heure_fin.split(":")[1]));

        let str_debut = startDateTime.toISOString();
        let str_fin = endDateTime.toISOString();
        
        const dateDebut = new Date(str_debut);
        const dateFin = new Date(str_fin);

        const agenda = await AgendaModel.findById(agendas);

        // Modifie tous les champs du rdv en conséquence
        const modifAppointment = await AppointmentModel.findByIdAndUpdate(
            id,
            {
            agenda :  agenda,
            nom : nom,
            date_Debut : dateDebut,
            date_Fin : dateFin
            }
        ) 

        // Sauvegarde la notification de modification dans la base de données
        await creerNotification(res.locals.user, id, undefined, 2);

        res.redirect(`/daily?day=${day}&month=${month}&year=${year}`);
    } catch (error) {
        next(error);
    }
}