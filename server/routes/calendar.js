import { getMonthData } from "../models/calendar.js";


export function routeCalendar(req, res) {
    const queryMonth = parseInt(req.query.month);
    const queryYear = parseInt(req.query.year);
    
    const today = new Date();
    const year = !isNaN(queryYear) ? queryYear : today.getFullYear();
    const month = !isNaN(queryMonth) ? queryMonth : today.getMonth();
    
    const monthNames = [
        "Janvier","Février","Mars","Avril","Mai","Juin",
        "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
    ];
    ;
    
    res.render("calendar/calendar", {
        month: month,
        year: year,
        monthName: monthNames[month],
        days: getMonthData(year, month),
    });
}