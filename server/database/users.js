import mongoose from "mongoose";
import { AgendaModel } from "./agenda.js";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    agendas: [{ type: Schema.Types.ObjectId, ref: "Agenda" }],
    token: { type: String, default: "" },
});

export const UserModel = mongoose.model("User", UserSchema);

/**
 * Cette fonction ajoute un agenda à un user
 * @param {User} user 
 * @param {Agenda} agenda 
 */
export function ajouterAgenda(user, agenda)
{
    user.agendas.push(agenda);
    user.save();
}

/**
 * Cette fonction crée un agenda par defaut à un user
 * @param {User} user le user à qui on crée un agenda par défaut
 */
export function ajouterAgendaParDefaut(user)
{
    const agenda = new AgendaModel({
        user: user,
        nom: "Agenda par défaut",
        description: "Un agenda créée par défaut",
        couleur: "orange",
    });
    agenda.save();
    ajouterAgenda(user, agenda);
}