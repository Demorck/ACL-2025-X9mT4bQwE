import { getAgendasForUser } from "../database/agenda.js";
import { getAppointmentsByUserAndDateRange } from "../database/appointment.js";
import { normalizeAppointment, arrangeAppointmentsInColumns } from "../utils/appointment.js";
import { parseDate } from "../utils/date.js";

export async function routeDaily(req, res, next) {
    if (!res.locals.user) {
        return res.redirect("/login");
    }

    // Code repris de server/routes/calendar.js
    let queryMonth = parseInt(req.query.month);
    let queryYear = parseInt(req.query.year);
    let queryDay = parseInt(req.query.day)

    let today = new Date();
    let year = !isNaN(queryYear) ? queryYear : today.getFullYear();
    let month = !isNaN(queryMonth) ? queryMonth : today.getMonth();
    let day = !isNaN(queryDay) ? queryDay : today.getDate();

    if (!day || !month || !year) {
        return next(new Error("Paramètres manquants pour la vue quotidienne !"));
    }

    let startOfDay = parseDate(day, month, year);
    let endOfDay = parseDate(day, month, year);
    endOfDay.setHours(23, 59, 59, 999);

    let appointments = await getAppointmentsByUserAndDateRange(res.locals.user, startOfDay, endOfDay);

    appointments = normalizeAppointment(appointments, startOfDay, endOfDay);
    appointments = arrangeAppointmentsInColumns(appointments);

    let agendas = await getAgendasForUser(res.locals.user);

    res.render("calendar/daily", {
        year,
        month,
        day,
        appointments,
        agendas,
    });
}
