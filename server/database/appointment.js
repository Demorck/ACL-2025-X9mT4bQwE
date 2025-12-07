import { TZDate } from "@date-fns/tz";
import mongoose from "mongoose";
import { getAgendasIdFromUserInvited } from "./invite_agenda.js";
import { sameDay } from "../utils/date.js";
import { addMonths, getDay, getDaysInMonth } from "date-fns";

const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
    agenda : { type: Schema.Types.ObjectId, ref: "Agenda", required: true },
    nom: { type: String, required: true },
    date_Debut: { type: Date, required: true },
    date_Fin: { type: Date, required: true },
    recurrenceRule: { type: Schema.Types.ObjectId, ref: "RegleOccurrence", required: false },
    exception: [{ type: Schema.Types.ObjectId, ref: "Appointment", required: false }],
    exceptionDate: [{ type: Date, required: false }],
    modifRecurrence: { type: Boolean, required: false },
    createur: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export const AppointmentModel = mongoose.model("Appointment", appointmentSchema);


export async function getAppointmentsByUserAndDateRange(user, startDate, endDate) {
    // let agendas = await AgendaModel.find({user: user._id}); 
    let agendas = user.agendas;
    const agendaOwnerIds = agendas.map(agenda => agenda._id);
    const agendasInvitesIds = await getAgendasIdFromUserInvited(user._id)
    const agendaIds = [...agendaOwnerIds, ...agendasInvitesIds.map(invite => invite.agenda)];


    let appointments = await AppointmentModel.find({
        agenda: { $in: agendaIds },
    })
        .populate("agenda")
        .populate("recurrenceRule")
        .sort({ date_Debut: 1 });

    let final = [];

    for (let app of appointments) {
        let occurrences = generateOccurrences(app, startDate, endDate);
        final.push(...occurrences);
    }
    
    return final.sort((a, b) => a.date_Debut - b.date_Debut);
}

function generateOccurrences(appointment, rangeStart, rangeEnd) {
    const rule = appointment.recurrenceRule;
    if (!rule) return [appointment]; // pas récurrent

    const exceptionDates = appointment.exceptionDate;
    let monthDayReference = undefined;

    const occurrences = [];

    let current = new TZDate(appointment.date_Debut);
    let duration = appointment.date_Fin - appointment.date_Debut;

    const freq = rule.frequence;
    const interval = parseInt(rule.intervale || "1");
    const recurrenceEnd = rule.date_fin ? new TZDate(rule.date_fin) : null;

    // Tant qu’on n’est pas après la plage
    while (current <= rangeEnd) {

        if (recurrenceEnd && current > recurrenceEnd) break;

        const currentEnd = new TZDate(current.getTime() + duration);

        // si l’occurrence est dans la plage => on garde
        if (currentEnd >= rangeStart && current <= rangeEnd && exceptionDates.filter(e => sameDay(current, e)).length == 0) {
            occurrences.push({
                ...appointment.toObject(),
                date_Debut: new TZDate(current),
                date_Fin: new TZDate(currentEnd),
                isOccurrence: true
            });
        }

        
        // occurrence suivante
        switch (freq) {
            case "day1":
                current.setDate(current.getDate() + interval);
                break;
            case "week1":
                current.setDate(current.getDate() + 7 * interval);
                break;
            case "month1":
                if (monthDayReference === undefined)
                    monthDayReference = current.getDate();
                  
                current = addMonths(current, 1)

                if (getDaysInMonth(current) > current.getDate() && current.getDate() < monthDayReference){  
                    current.setDate(monthDayReference);
                }
                break;
            case "year1":
                current.setFullYear(current.getFullYear() + interval);
                break;
            default:
                return occurrences;
        }
    }

    return occurrences;
}
