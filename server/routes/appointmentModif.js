import { AgendaModel, getAgendasForUser } from "../database/agenda.js";
import { AppointmentModel } from "../database/appointment.js";
import { toLocalDateHours } from "../utils/date.js";
import { creerNotification } from "../database/notification.js";
import { UserModel } from "../database/users.js";
/**
 * Fonction qui permet l'affichage du rdv que l'on souhaite modifier
 * @param {*} req 
 * @param {*} res 
 */
export async function routeModif(req, res, next) {
    try {
        if (!res.locals.user) {
            return res.redirect("/login");
        }

        const {id, day, month, year, agendaId} = req.body;

        const appointment = await AppointmentModel.findById(id);
        if (!appointment) {
            return res.status(404).send("Rendez-vous introuvable");
        }
        
        const agenda = await AgendaModel.findById(agendaId).populate('user');
        if (!agenda) {
            return res.status(404).send("Agenda introuvable");
        }

        const createurUser = await UserModel.findById(appointment.createur);        
        if (!createurUser) {
            return res.status(404).send("Utilisateur introuvable");
        }

        const validAgendas = await getAgendasForUser(res.locals.user);

        const isTheOwner = res.locals.user._id.toString() !== agenda.user._id.toString();

        res.render('appointments/modifAppointment', {
            rendezVous: appointment,
            agenda: agenda,
            day: day,
            month: month,
            year: year,
            agendas: validAgendas,
            isTheOwner: isTheOwner,
            createur: createurUser,
        });
    } catch (error) {
        next(error);
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

        const userAgenda = await AgendaModel.findById(agendaId);
        await userAgenda.populate('user');
        const userObject = userAgenda.user._id;

        if(res.locals.user._id.toString() != userObject.toString()){
            return res.status(400).send("Ce rendez-vous ne vous appartient pas");
        }

        // Sauvegarde la notification de suppression dans la base de données
        await creerNotification(userAgenda.user, id, userAgenda, 3);

        // Supprime le rendez-vous
        await AppointmentModel.findByIdAndDelete(id); 


        res.redirect(`/calendar/day?day=${day}&month=${month}&year=${year}`);
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

        const appointment = await AppointmentModel.findById(id);
        if (!appointment) {
            return res.status(400).send("Rendez-vous introuvable");
        }

        const startDateTime = toLocalDateHours(date_debut, parseInt(heure_debut.split(":")[0]), parseInt(heure_debut.split(":")[1]));
        const endDateTime = toLocalDateHours(date_fin, parseInt(heure_fin.split(":")[0]), parseInt(heure_fin.split(":")[1]));

        let str_debut = startDateTime.toISOString();
        let str_fin = endDateTime.toISOString();
        
        const dateDebut = new Date(str_debut);
        const dateFin = new Date(str_fin);

        let agenda = await AgendaModel.findById(agendas);
        if(agenda===null)
        {
            agenda = appointment.agenda;
        }


        // Tester si le user veut changer l'agenda sans qu'il n'y soit autorisé
        const ancienAgenda = await AgendaModel.findById(appointment.agenda);
        const chgtAgenda = agenda.toString() !== appointment.agenda.toString();

        if(res.locals.user._id.toString() !== ancienAgenda.user._id.toString() && chgtAgenda){
            return res.status(400).send("Vous ne pouvez pas changer l'agenda d'un rendez-vous qui ne vous appartient pas");
        }


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
        await creerNotification(res.locals.user, id, agenda, 2);

        res.redirect(`/calendar/day?day=${day}&month=${month}&year=${year}`);
    } catch (error) {
        next(error);
    }
}