import { AppointmentModel } from "../database/appointment.js";
import { AgendaModel, getAgendasForUser } from "../database/agenda.js";
import { toLocalDateHours } from "../utils/date.js";
import { creerNotification } from "../database/notification.js";
import { RegleOccurrenceModel } from "../database/regle_occurrence.js";


export async function routeNewAppointment(req, res) {
    if(!res.locals.user)
        return res.redirect("/login");

    const queryMonth = parseInt(req.query.month);
    const queryYear = parseInt(req.query.year);
    const queryDay = parseInt(req.query.day);

    const queryBeginningHour = parseInt(req.query.beginningHour);
    let beginningHour = 0;
    let endHour = 0;
    if(isNaN(queryBeginningHour))
    {
        beginningHour = 8;
        endHour = 12;
    }else
    {
        beginningHour = queryBeginningHour;
        endHour = queryBeginningHour+1;
    }
    
    const today = new Date();
    const year = !isNaN(queryYear) ? queryYear : today.getFullYear();
    const month = !isNaN(queryMonth) ? queryMonth : today.getMonth();
    const day = !isNaN(queryDay) ? queryDay : today.getDate();
    
    const monthNames = [
        "Janvier","Février","Mars","Avril","Mai","Juin",
        "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
    ];

    // Récupérer tous les agendas d'un user
    const validAgendas = await getAgendasForUser(res.locals.user); 
    
    res.render("appointments/newAppointment", {
        day: day,
        month: month,
        year: year,
        beginningHour: beginningHour,
        endHour: endHour,
        monthName: monthNames[month],
        agendas: validAgendas,
    });
}

export async function routeAddAppointmentToDatabase(req, res, next) {
    try {

        if(!res.locals.user)
            return res.redirect("/login");

        const { nom, date_debut, date_fin, heure_debut, heure_fin, day, month, year, agendas, recurrence, frequenceId, fin_rec, date_fin_rec } = req.body; 

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

        if(recurrence === 'on'){
            let dateFinRec = '';

            if(fin_rec == 'never'){
                dateFinRec = null;
            }else{
                dateFinRec = new Date(date_fin_rec);
            }     

            const newRegleOccurrence = new RegleOccurrenceModel({
                frequence: frequenceId,
                date_fin: dateFinRec,
            });

            await newRegleOccurrence.save();

            const regleOccurrenceID = newRegleOccurrence._id;

            // Créer une nouvelle instance du modèle Appointment avec la regle de recurrence
            const newAppointment = new AppointmentModel({
                agenda: agenda,
                nom: nom,
                date_Debut: dateDebut,
                date_Fin: dateFin,
                recurrenceRule: regleOccurrenceID,
                createur: res.locals.user,
            });

            // Sauvegarde le nouveau rendez-vous dans la base de données
            await newAppointment.save();  

            // Sauvegarde la notification de création dans la base de données
            await creerNotification(res.locals.user, newAppointment, res.locals.user, undefined, 1);

        }else{
            // Créer une nouvelle instance du modèle Appointment sans regle de recurrence
            const newAppointment = new AppointmentModel({
                agenda: agenda,
                nom: nom,
                date_Debut: dateDebut,
                date_Fin: dateFin,
                createur: res.locals.user,
            });

            // Sauvegarde le nouveau rendez-vous dans la base de données
            await newAppointment.save();

            // Sauvegarde la notification de création dans la base de données
            await creerNotification(res.locals.user, newAppointment, res.locals.user, undefined, 1);
        }

        // Sauvegarde la notification de création dans la base de données
        //await creerNotification(res.locals.user, newAppointment, res.locals.user, agenda, 1);
        
        // Rediriger l'utilisateur vers la page journalière où le RDV a été ajouté
        res.redirect(`/calendar/day?day=${day}&month=${month}&year=${year}`);
    } catch (error) {
        next(error);
    }
}