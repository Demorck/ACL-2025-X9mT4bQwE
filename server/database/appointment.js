import { TZDate } from "@date-fns/tz";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
    agenda : { type: Schema.Types.ObjectId, ref: "Agenda", required: true },
    nom: { type: String, required: true },
    date_Debut: { type: Date, required: true },
    date_Fin: { type: Date, required: true },
    recurrenceRule: { type: Schema.Types.ObjectId, ref: "RegleOccurrence", required: false },
    createur: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export const AppointmentModel = mongoose.model("Appointment", appointmentSchema);


export async function getAppointmentsByUserAndDateRange(user, startDate, endDate) {
    // let agendas = await AgendaModel.find({user: user._id}); 
    let agendas = user.agendas;
    let agendaIds = agendas.map(agenda => agenda._id);
    
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
        if (currentEnd >= rangeStart && current <= rangeEnd) {
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
                current.setDate(current.getDate() + 2);
                break;
            case "week1":
                current.setDate(current.getDate() + 7 * interval);
                break;
            case "month1":
                current.setMonth(current.getMonth() + interval);
                break;
            default:
                return occurrences;
        }
    }

    return occurrences;
}
