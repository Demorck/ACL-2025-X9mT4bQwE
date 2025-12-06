import { TZDate } from "@date-fns/tz";
import { getAppointmentsByUserAndDateRange } from "../database/appointment.js";
import { normalizeAppointment, arrangeAppointmentsInColumns } from "../utils/appointment.js";
import { formatDate, getMonthDateArraysByWeeks, toLocalDate } from "../utils/date.js";

async function getAppointments(user, startDate, endDate) {
    let appointments = await getAppointmentsByUserAndDateRange(user, startDate, endDate);
    appointments = normalizeAppointment(appointments, startDate, endDate);
    appointments = arrangeAppointmentsInColumns(appointments);

    return appointments;
}

/**
 * Obtient les données pour une journée spécifique.
 * 
 * @export
 * @param {Number} year 
 * @param {Number} month 
 * @param {Number} day 
 * @param {User} user 
 * @returns {{dayLabel: string, appointments: Array}}
 */
export function getDayData(day, month, year, user) {
    let startISODate = new TZDate(year, month, day);
    let endISODate = new TZDate(year, month, day + 1);

    let appointments = getAppointments(user, startISODate, endISODate).then(app => {
        let dayLabel = formatDate(toLocalDate(startISODate), "dd/MM/yyyy");

        return {
            dayLabel,
            requestedDay: startISODate,
            appointments: app
        }

    }).catch(err => {
        throw new Error(err);
    });

    return appointments;
}


/**
 * Obtient les données pour une semaine spécifique.
 * 
 * @export
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @param {User} user 
 * @returns {{dayLabel: string, appointments: Array}}
 */
export function getWeekData(startDate, endDate, user) {
    let appointments = getAppointments(user, startDate, endDate).then(app => {
        let startLabel = formatDate(toLocalDate(startDate), "dd/MM/yyyy");
        let endLabel = formatDate(toLocalDate(new TZDate(endDate.getTime() - 1)), "dd/MM/yyyy");

        let days = [];
        for (let d = toLocalDate(startDate); d <= toLocalDate(endDate); d.setDate(d.getDate() + 1)) {
            days.push(new TZDate(d));
        }

        let daysLabel = days.map(d => formatDate(d, "eee, dd/MM"));

        return {
            startLabel,
            endLabel,
            appointments: app,
            days,
            daysLabel 
        }
    }).catch(err => {
        throw new Error(err);
    });

    return appointments;
}


/**
 * Obtient les données pour un mois spécifique.
 * 
 * @export
 * @param {Number} year 
 * @param {Number} month 
 * @param {User} user 
 * @returns {{dayLabel: string, appointments: Array}}
 */
export function getMonthData(year, month, user) {
    let startISODate = new TZDate(year, month, 1);
    let startOfMonth = new TZDate(startISODate);
    let endISODate = new TZDate(year, month + 1, 1);

    let startLocal = toLocalDate(startISODate);
    let startDow = startLocal.getDay(); 
    let startOffset = (startDow + 6) % 7; 
    startLocal.setDate(startLocal.getDate() - startOffset);
    startISODate = new TZDate(startLocal);

    let endLocal = toLocalDate(endISODate); 
    let endDow = endLocal.getDay();
    let endOffset = (7 - ((endDow + 6) % 7)) % 7; 
    endLocal.setDate(endLocal.getDate() + endOffset);
    endISODate = new TZDate(endLocal);
    
    let appointments = getAppointments(user, startISODate, endISODate).then(app => {
        let startLabel = formatDate(toLocalDate(startOfMonth), "LLLL yyyy");
        startLabel = startLabel.charAt(0).toUpperCase() + startLabel.slice(1);

        return {
            startLabel,
            days: getMonthDateArraysByWeeks(year, month),
            appointments: app,
            requestedMonth: month
        }
    }).catch(err => {
        throw new Error(err);
    });

    return appointments;
}

/**
 * Obtient les données pour une année spécifique
 * 
 * @export
 * @param {Number} year 
 * @param {User} user 
 * @returns {{yearLabel: string, months: Array, appointments: Array}}
 */
export function getYearData(year, user) {
    let startISODate = new TZDate(year, 0, 1); // 1er janvier
    let endISODate = new TZDate(year + 1, 0, 1); // 1er janvier de l'année suivante

    let appointments = getAppointments(user, startISODate, endISODate).then(app => {
        let months = [];
        for (let month = 0; month < 12; month++) {
            let monthDate = new TZDate(year, month, 1);
            let daysInMonth = new Date(year, month + 1, 0).getDate();
            
            months.push({
                name: formatDate(monthDate, "MMM"),
                monthIndex: month,
                daysInMonth: daysInMonth,
                days: Array.from({ length: 31 }, (_, i) => {
                    if (i < daysInMonth) {
                        return new TZDate(year, month, i + 1);
                    }
                    return null;
                })
            });
        }

        return {
            yearLabel: year.toString(),
            year: year,
            months: months,
            appointments: app
        }
    }).catch(err => {
        throw new Error(err);
    });

    return appointments;
}