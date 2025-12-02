import mongoose from "mongoose";
import { ajouterAgenda } from "./users.js";
import { creerNotification } from "../services/notificationService.js";
import { AppointmentModel } from "./appointment.js";
import ical from "ical-generator";
import { RegleOccurrenceModel } from "./regle_occurrence.js";


const Schema = mongoose.Schema;

// TODO: Ajouter les dates en index pour accélérer les recherches.
const agendaSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    nom: { type: String, required: true },
    description: { type: String, required: false },
    couleur: {type: String, required: true},
    invites: [{type: Schema.Types.ObjectId, ref: "User"}],
});

export const AgendaModel = mongoose.model("Agenda", agendaSchema);

/**
 * Cette fonction créée un agenda et l'ajoute au user
 * @param {User} user 
 * @param {String} nom 
 * @param {String} description 
 * @param {String} couleur 
 */
export async function creerAgenda(user, nom, description, couleur)
{
    const agenda = new AgendaModel({
        user: user,
        nom: nom,
        description: description,
        couleur: couleur,
    });
    await agenda.save();

    await ajouterAgenda(user, agenda); 
    // sauvegarder la notification dans la bdd
    await creerNotification(user, undefined, user, agenda, 0);

    return agenda;
}

/**
 * Renvoi la liste des agendas d'un user
 * @param {User} user 
 */
export async function getAgendasForUser(user)
{
    const agendasUserIds = user.agendas;
    const agendasPromises = agendasUserIds.map(agendaId => AgendaModel.findById(agendaId));
    const agendas = await Promise.all(agendasPromises);
    const validAgendas = agendas.filter(agenda => agenda !== null);

    return validAgendas;
}

export async function getAgendasById(id){
    const agenda = await AgendaModel.findById(id);
    return agenda; 
}

export async function listAgendas(user) {
    const agendas = await AgendaModel.find({
        $or: [
            { user: user._id },
            { invites: user._id }
        ]
    });
    return agendas;
}

export async function deleteAgenda(user, agendaId) {
    await AgendaModel.deleteOne({_id: agendaId});
    await mongoose.model("User").updateOne({_id: user._id}, {$pull: {agendas: agendaId}});
}

export async function editAgenda(agendaId, nom, description, couleur) {
    const agenda = {
        nom,
        description,
        couleur
    };

    await AgendaModel.updateOne(
        { _id: agendaId },
        { $set: agenda }
    );
}

export async function addInvite(agendaId, userId) {
    const agenda = await AgendaModel.findById(agendaId);
    if (!agenda) {
        console.error(`addInvite: Agenda non trouvé avec l'ID ${agendaId}`);
        return;
    }

    const user = await mongoose.model("User").findById(userId);
    if (!user) {
        console.error(`addInvite: Utilisateur non trouvé avec l'ID ${userId}`);
        return;
    }

    agenda.invites.push(userId);
    await agenda.save();
    await creerNotification(user, undefined, user, agenda, 4);
    user.agendas.push(agendaId);
    await user.save();
}

export async function removeInvite(agendaId, userId){
    const agenda = await AgendaModel.findById(agendaId);
    if (!agenda) {
        console.error(`removeInvite: Agenda non trouvé avec l'ID ${agendaId}`);
        return;
    }
    agenda.invites.pull(userId);
    await agenda.save();
    const user = await mongoose.model("User").findById(userId);
    await creerNotification(user, undefined, user, agenda, 5);
    user.agendas.pull(agendaId);
    await user.save();
}

export async function getInvites(agendaId){
    const agenda = await AgendaModel.findById(agendaId);
    return agenda.invites;
}

export async function isInviteInAgenda(agendaId, userId){
    const agenda = await AgendaModel.findById(agendaId);
    return agenda.invites.includes(userId);
}

export async function creerIcal(agendaId)
{
    const agenda = await AgendaModel.findById(agendaId);

    // Récuperer tous les RDV liés à l'agenda
    const appointments = await AppointmentModel.find({agenda: agendaId});
    // Les rentrer dans un .ics
    const agendaToExport = ical({ name: agenda.nom, description: agenda.description});

    for (const appointment of appointments) {
        const regleOccurrence = await RegleOccurrenceModel.findById(appointment.recurrenceRule);
        // Vérifier s'il y a une règle d'occurence sur cet évenement
        const rruleConfig = {}; 

        if (regleOccurrence) {
            let freq = "";
            
            switch (regleOccurrence.frequence) {
                case "day1": freq = "DAILY"; break;
                case "week1": freq = "WEEKLY"; break;
                case "month1": freq = "MONTHLY"; break;
                case "year1": freq = "YEARLY"; break;
                default: break;
            }
            // Si une fréquence valide est trouvée, on commence à construire rruleConfig
            if (freq) {
                rruleConfig.freq = freq;
                if (regleOccurrence.date_fin) {
                    rruleConfig.until = new Date(regleOccurrence.date_fin);
                }
            }
        }        
        const eventData = {
            start: appointment.date_Debut,
            end: appointment.date_Fin,
            summary : appointment.nom,
        };
        
        if (Object.keys(rruleConfig).length > 0) {
            eventData.repeating = rruleConfig;
        }
        

        agendaToExport.createEvent(eventData);
    }

    // console.log(agendaToExport.toString());
    return agendaToExport.toString();

}