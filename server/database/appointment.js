import mongoose from "mongoose";

const Schema = mongoose.Schema;

// TODO: Ajouter les dates en index pour accélérer les recherches.
const appointmentSchema = new Schema({
    // user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    agenda : { type: Schema.Types.ObjectId, ref: "Agenda", required: true },
    nom: { type: String, required: true },
    date_Debut: { type: Date, required: true },
    date_Fin: { type: Date, required: true },
});

export const AppointmentModel = mongoose.model("Appointment", appointmentSchema);

/**
 * Cette fonction renvoie un tableau des rendez-vous qui ont lieu durant une journée donnée.
 * @param {Date} day - Un objet Date représentant le jour pour lequel on cherche les rendez-vous.
 * @return {Promise<Array>} Une promesse qui se résout avec un tableau des rendez-vous trouvés.
 */
export async function getAppointmentsForDay(day,agenda)
{
    if(agenda === null)
    {
        //Si aucun user connecté alors renvoyer une liste vide
        return [];
    }

    // Définir le début du jour
    const startOfDay = new Date(day);
    startOfDay.setUTCHours(0, 0, 0, 0);

    // Définir la fin du jour
    const endOfDay = new Date(day);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const appointments = await AppointmentModel.find({
        agenda: agenda,
        date_Debut: { $lte: endOfDay }, // Le RDV commence avant ou pendant la journée
        date_Fin: { $gte: startOfDay }, // et se termine pendant ou après la journée
    });
    
    return appointments;
}