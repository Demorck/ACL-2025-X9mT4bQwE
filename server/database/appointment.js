import mongoose from "mongoose";

const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" }, // required: true a été temporairement enlevé en attendant qu'on puisse se connecter
    nom: { type: String, required: true },
    date_Debut: { type: Date, required: true },
    date_Fin: { type: Date, required: true },
});

export const AppointmentModel = mongoose.model("Appointment", appointmentSchema);