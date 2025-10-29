import mongoose from "mongoose";
import { ajouterAgenda } from "./users.js";
import { validateHeaderName } from "http";
import { creerNotification } from "./notification.js";

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
    await creerNotification(user, undefined, agenda, 0);
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