import { AppointmentModel } from "../database/appointment.js";
import { normalizeAppointment } from "../utils/appointment.js";
import { formatDate, getFirstDayOfWeek } from "../utils/date.js";

export async function routeWeekly(req, res, next) {
    if (!res.locals.user) {
        return res.redirect("/login");
    }

    let { year, month, day } = req.query;

    if (!year || !month || !day) {
        let today = new Date();
        return res.redirect(`/week?year=${today.getFullYear()}&month=${today.getMonth()}&day=${today.getDate()}`);
    }

    let referenceDate = new Date(year, month, day);
    referenceDate.setHours(0, 0, 0, 0);

    // Le lundi
    let dayOfWeek = (referenceDate.getDay() + 6) % 7;
    let startOfWeek = new Date(referenceDate);
    startOfWeek.setDate(referenceDate.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    // Le dimanche
    let endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    let appointments = await AppointmentModel.find({
        date_Debut: { $lt: endOfWeek },
        date_Fin: { $gte: startOfWeek },
    })
    .populate("agenda")
    .sort({ date_Debut: 1 });
    

    let appointmentsByDay = normalizeAppointment(appointments, startOfWeek, endOfWeek);
    
    // Un tableau de tableaux où le premier tableau est le premier jour de la semaine
    // et chaque tableau contient les rendez-vous de ce jour
    let sortAppointments = [];
    for (let i = 0; i < 7; i++) {
        sortAppointments[i] = [];
        appointmentsByDay.forEach((app) => {
            let appDate = new Date(app.start);
            appDate.setHours(0, 0, 0, 0);
            let currentDate = new Date(startOfWeek);
            currentDate.setDate(startOfWeek.getDate() + i);
            currentDate.setHours(0, 0, 0, 0);
            if (appDate.getTime() === currentDate.getTime()) {
                sortAppointments[i].push(app);
            }
        });
    }

    let processedByDay = {};
    sortAppointments.forEach((currentDayAppointments, i) => {
        const sorted = currentDayAppointments.sort((a, b) => a.start - b.start);
        const columns = [];

        for (const app of sorted) {
            let placed = false;
            for (const col of columns) {
                if (col[col.length - 1].end <= app.start) {
                    col.push(app);
                    placed = true;
                    break;
                }
            }
            if (!placed) columns.push([app]);
        }

        const totalCols = columns.length;
        columns.forEach((col, j) => {
            col.forEach((app) => {
                app.colIndex = j;
                app.colCount = totalCols;
            });
        });

        processedByDay[i] = columns.flat();
    });
    
    
    res.render("calendar/weekly", {
        year,
        month,
        day,
        appointmentsByDay: sortAppointments,
        firstDayOfWeek: getFirstDayOfWeek(referenceDate)
    }); 


}