import mongoose from "mongoose";
import { AgendaModel } from "./agenda.js";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    agendas: [{ type: Schema.Types.ObjectId, ref: "Agenda" }],
    notifications: [{ type: Schema.Types.ObjectId, ref: "Notification", required: false}], // liste des notifications liées à l'utilisateur
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
    return user.save();
}

/**
 * Cette fonction ajoute une notification à un user
 * @param {User} user 
 * @param {Notification} notification 
 */
export function ajouterNotification(user, notification) {
    user.notifications.push(notification);
    return user.save();
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