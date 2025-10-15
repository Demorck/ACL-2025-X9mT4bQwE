import { AppointmentModel } from "../database/appointment.js";

export function routeNewAppointment(req, res) {
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
    
    res.render("calendar/newAppointment", {
        day: day,
        month: month,
        year: year,
        beginningHour: beginningHour,
        endHour: endHour,
        monthName: monthNames[month],
    });
}

export async function routeAddAppointmentToDatabase(req, res, next) {
    try {
        const { nom, date_debut, date_fin, heure_debut, heure_fin, day, month, year } = req.body;
        
        const startDateTime = new Date(`${date_debut}T${heure_debut}:00.000Z`);
        const endDateTime = new Date(`${date_fin}T${heure_fin}:00.000Z`);

        


        // Créer une nouvelle instance du modèle Appointment
        const newAppointment = new AppointmentModel({
            user: res.locals.user, 
            nom: nom,
            date_Debut: startDateTime,
            date_Fin: endDateTime,
        });

        // Sauvegarder le nouveau rendez-vous dans la base de données
        await newAppointment.save();

        // Rediriger l'utilisateur vers la page journalière où le RDV a été ajouté
        res.redirect(`/daily?day=${day}&month=${month}&year=${year}`);
    } catch (error) {
        next(error);
    }
}