import mongoose from "mongoose";
import { AgendaModel } from "./agenda.js";

const Schema = mongoose.Schema;

// TODO: Ajouter les dates en index pour accélérer les recherches.
const appointmentSchema = new Schema({
    agenda : { type: Schema.Types.ObjectId, ref: "Agenda", required: true },
    nom: { type: String, required: true },
    date_Debut: { type: Date, required: true },
    date_Fin: { type: Date, required: true },
});

export const AppointmentModel = mongoose.model("Appointment", appointmentSchema);


export async function getAppointmentsByUserAndDateRange(user, startDate, endDate) {
    let agendas = await AgendaModel.find({user: user._id});
    let agendaIds = agendas.map(agenda => agenda._id);

    let appointments = await AppointmentModel.find({
        agenda: { $in: agendaIds },
        date_Debut: { $lt: endDate },
        date_Fin: { $gte: startDate },
    })
        .populate("agenda")
        .sort({ date_Debut: 1 });

    return appointments;
}