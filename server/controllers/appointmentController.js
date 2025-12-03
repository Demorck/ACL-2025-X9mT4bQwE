import { AgendaModel, getAgendasForUser } from "../database/agenda.js";
import { AppointmentModel } from "../database/appointment.js";
import { UserModel } from "../database/users.js";
import { buildAppointmentFormData } from "../services/appointmentService.js";



export async function renderNewAppointment(req, res) {
    if(!res.locals.user) return res.redirect("/login");

    const queryMonth = parseInt(req.query.month);
    const queryYear = parseInt(req.query.year);
    const queryDay = parseInt(req.query.day);
    const queryBeginningHour = parseInt(req.query.beginningHour);

    const beginningHour = !isNaN(queryBeginningHour) ? queryBeginningHour : 8;
    
    const validAgendas = await getAgendasForUser(res.locals.user);

    const formData = buildAppointmentFormData({
        user: res.locals.user,
        day: queryDay,
        month: queryMonth,
        year: queryYear,
        beginningHour
    });
    
    res.render("modals/appointments/form", {
        ...formData,
        agendas: validAgendas,
        action: "/appointment/add",
        submitText: "Ajouter",
        title: "Nouveau rendez-vous",
        isTheOwner: false,
        createur: null
    });
}

export async function renderEditAppointment(req, res,  next) {
    try {
        if(!res.locals.user) return res.redirect("/login");

        const { id, day, month, year, agendaId } = req.body;
        
        const appointment = await AppointmentModel.findById(id).populate('recurrenceRule');
        if(!appointment) return res.status(404).send("Rendez-vous introuvable");

        const agenda = await AgendaModel.findById(agendaId).populate('user');
        if(!agenda) return res.status(404).send("Agenda introuvable");

        const createurUser = await UserModel.findById(appointment.createur);
        if(!createurUser) return res.status(404).send("Utilisateur introuvable");

        const validAgendas = await getAgendasForUser(res.locals.user);
        
        const isTheOwner = res.locals.user._id.toString() !== agenda.user._id.toString();

        const formData = buildAppointmentFormData({
            user: res.locals.user,
            appointment,
            day,
            month,
            year,
            selectedAgenda: appointment.agenda.toString()
        });

        res.render("modals/appointments/form", {
            ...formData,
            agendas: validAgendas,
            action: "/appointment/update",
            submitText: "Modifier",
            title: "Modifier le rendez-vous",
            isTheOwner,
            createur: createurUser
        });

    } catch (error) {
        next(error);
    }
}