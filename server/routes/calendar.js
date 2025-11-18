import { TZDate } from "@date-fns/tz";
import { getAgendasForUser } from "../database/agenda.js";
import { getDayData, getWeekData, getMonthData } from "../models/appointment.js";
import { formatDate, getFirstDayOfWeek } from "../utils/date.js";

function getDateFromQuery(query) {
    let queryMonth = parseInt(query.month);
    let queryYear = parseInt(query.year);
    let queryDay = parseInt(query.day)

    let today = new Date();
    let year = !isNaN(queryYear) ? queryYear : today.getFullYear();
    let month = !isNaN(queryMonth) ? queryMonth : today.getMonth();
    let day = !isNaN(queryDay) ? queryDay : today.getDate();

    return { day, month, year };
}

export async function routeCalendar(req, res) {
    if (!res.locals.user) {
        return res.redirect("/login");
    }

    let { day, month, year } = getDateFromQuery(req.query);
    let requestedDate = new TZDate(year, month, day);

    let view = req.params.view || "week";
    let agendas = await getAgendasForUser(res.locals.user);
    let data = {};
    let title = "";
    let previous_url = "";
    let after_url = "";


    switch(view) {
        case "day":
            data = await getDayData(day, month, year, res.locals.user);
            title = "Jour du " + data.dayLabel;
            previous_url = `/calendar/day?day=${day - 1}&month=${month}&year=${year}`;
            after_url = `/calendar/day?day=${day + 1}&month=${month}&year=${year}`;
            break;
        case "week":
            let startOfWeek = getFirstDayOfWeek(requestedDate, { weekStartsOn: 1 });
            let endOfWeek = new TZDate(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            data = await getWeekData(startOfWeek, endOfWeek, res.locals.user);
            title = "Semaine du " +  data.startLabel + " au " + data.endLabel;
            previous_url = `/calendar/week?day=${startOfWeek.getDate() - 7}&month=${startOfWeek.getMonth()}&year=${startOfWeek.getFullYear()}`;
            after_url = `/calendar/week?day=${startOfWeek.getDate() + 7}&month=${startOfWeek.getMonth()}&year=${startOfWeek.getFullYear()}`;
            break;
        case "month":
            data = await getMonthData(requestedDate.getFullYear(), requestedDate.getMonth(), res.locals.user);
            data.monthName = formatDate(requestedDate, "LLLL yyyy");
            title = data.startLabel;
            previous_url = `/calendar/month?month=${requestedDate.getMonth() - 1}&year=${requestedDate.getFullYear()}`;
            after_url = `/calendar/month?month=${requestedDate.getMonth() + 1}&year=${requestedDate.getFullYear()}`;
            break;
        default:
            return res.redirect("/calendar/week");
    }

    data.agendas = agendas;

    res.render(`calendar/views/${view}`, {
        title,
        view,
        data,
        requestedDate,
        previous_url,
        after_url,
    });
}
