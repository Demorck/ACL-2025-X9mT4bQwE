import { AgendaModel, getAgendasForUser } from "../database/agenda.js";
import { AppointmentModel } from "../database/appointment.js";
import { toLocalDateHours } from "../utils/date.js";
import { creerNotification } from "../database/notification.js";
import { RegleOccurrenceModel } from "../database/regle_occurrence.js";

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

    if(appointment){
        if(appointment.recurrenceRule){
            const regleOccurenceModif = await RegleOccurrenceModel.findById(appointment.recurrenceRule);

            const frequenceModif = regleOccurenceModif.frequence;
            const date_finModif = regleOccurenceModif.date_fin;

            res.render('appointments/modifAppointment', {
                rendezVous: appointment,
                agendaName: agendaName,
                day: day,
                month: month,
                year: year,
                agendas: validAgendas,
                regle: regleOccurenceModif,
                recurrence: true,
                frequence: frequenceModif,
                date_fin: date_finModif,
            });
        }else{
            res.render('appointments/modifAppointment', {
                rendezVous: appointment,
                agendaName: agendaName,
                day: day,
                month: month,
                year: year,
                agendas: validAgendas,
                recurrence: false,
            });
        }
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
        const {id, idRegle, nom, date_debut, heure_debut, date_fin, heure_fin, day, month, year, agendas, recurrence, frequenceId, fin_rec, date_fin_rec} = req.body;

        const startDateTime = toLocalDateHours(date_debut, parseInt(heure_debut.split(":")[0]), parseInt(heure_debut.split(":")[1]));
        const endDateTime = toLocalDateHours(date_fin, parseInt(heure_fin.split(":")[0]), parseInt(heure_fin.split(":")[1]));

        let str_debut = startDateTime.toISOString();
        let str_fin = endDateTime.toISOString();
        
        const dateDebut = new Date(str_debut);
        const dateFin = new Date(str_fin);

        const agenda = await AgendaModel.findById(agendas);        

        if(agenda === null)
        {
            return res.status(400).send("Aucun agenda trouvé");
        }

        const appointment = await AppointmentModel.findById(id);

        if(recurrence === 'on' && appointment.recurrenceRule){
            let dateFinRec = '';

            if(fin_rec == 'never'){
                dateFinRec = null;
            }else{
                dateFinRec = new Date(date_fin_rec);
            }     

            const modifRegleOccurrence = await RegleOccurrenceModel.findByIdAndUpdate(
                idRegle,
                {
                frequence: frequenceId,
                date_fin: dateFinRec,
                }
            );

            const modifAppointment = await AppointmentModel.findByIdAndUpdate(
                id,
                {
                agenda :  agenda,
                nom : nom,
                date_Debut : dateDebut,
                date_Fin : dateFin,
                recurrenceRule: modifRegleOccurrence,
                }
            ); 

            // Sauvegarde la notification de modification dans la base de données
            await creerNotification(res.locals.user, id, undefined, 2);

        }else if(recurrence ==='on'){
            let dateFinRec = '';

            if(fin_rec == 'never'){
                dateFinRec = null;
            }else{
                dateFinRec = new Date(date_fin_rec);
            }     

            const newRegle = new RegleOccurrenceModel({
                frequence: frequenceId,
                date_fin: dateFinRec,
            });
            
            await newRegle.save();

            const regleOccId = newRegle._id;

            const modifAppointment = await AppointmentModel.findByIdAndUpdate(
                id,
                {
                agenda :  agenda,
                nom : nom,
                date_Debut : dateDebut,
                date_Fin : dateFin,
                recurrenceRule: regleOccId,
                }
            ); 

            // Sauvegarde la notification de modification dans la base de données
            await creerNotification(res.locals.user, id, undefined, 2);
        }else{
            // Modifie tous les champs du rdv en conséquence
            const modifAppointment = await AppointmentModel.findByIdAndUpdate(
                id,
                {
                agenda :  agenda,
                nom : nom,
                date_Debut : dateDebut,
                date_Fin : dateFin,
                $unset: { recurrenceRule: 1 },
                }
            );
            // Sauvegarde la notification de modification dans la base de données
            await creerNotification(res.locals.user, id, undefined, 2);
        }

        res.redirect(`/calendar/day?day=${day}&month=${month}&year=${year}`);
    } catch (error) {
        next(error);
    }
}