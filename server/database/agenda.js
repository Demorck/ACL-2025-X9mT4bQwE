import mongoose from "mongoose";
import { ajouterAgenda } from "./users.js";

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
export function creerAgenda(user, nom, description, couleur)
{
    const agenda = new AgendaModel({
        user: user,
        nom: nom,
        description: description,
        couleur: couleur,
    });
    agenda.save();

    ajouterAgenda(user, agenda);

}