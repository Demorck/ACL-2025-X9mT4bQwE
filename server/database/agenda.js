import mongoose from "mongoose";
import { ajouterAgenda } from "./users.js";
import { creerNotification } from "../services/notificationService.js";
import { getAgendasIdFromUserInvited, getAgendasIdFromUserInvitedAboveLevel } from "./invite_agenda.js";

const Schema = mongoose.Schema;

// TODO: Ajouter les dates en index pour accélérer les recherches.
const agendaSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    nom: { type: String, required: true },
    description: { type: String, required: false },
    couleur: {type: String, required: true},
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
}

/**
 * Renvoi la liste des agendas d'un user
 * @param {User} user 
 */
export async function getAgendasForUser(user)
{
    const agendasOwnedUserIds = user.agendas;
    const agendasInvitesIds = await getAgendasIdFromUserInvited(user._id)
    const agendasUserIds = [...agendasOwnedUserIds, ...agendasInvitesIds.map(invite => invite.agenda)];
    const agendasPromises = agendasUserIds.map(agendaId => AgendaModel.findById(agendaId));
    const agendas = await Promise.all(agendasPromises);
    const validAgendas = agendas.filter(agenda => agenda !== null);

    return validAgendas;
}

/**
 * Renvoi la liste des agendas qu'un user peut ajouter des RDV
 * @param {User} user 
 */
export async function getAgendasAllowedToAddForUser(user)
{
    const agendasOwnedUserIds = user.agendas;
    const agendasInvitesIds = await getAgendasIdFromUserInvitedAboveLevel(user._id,2)
    const agendasUserIds = [...agendasOwnedUserIds, ...agendasInvitesIds.map(invite => invite.agenda)];
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
            user: user._id 
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

