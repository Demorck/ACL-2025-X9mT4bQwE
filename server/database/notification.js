import mongoose from "mongoose";
import { ajouterNotification } from "./users.js";
import { app } from "../app.js";

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref:"User", required: true }, // user lié à la notification
    appointment: { type: Schema.Types.ObjectId, ref:"Appointment", required: false }, // à renseigner quand c'est une notification en rapport avec un rdv
    user_concerned: { type: Schema.Types.ObjectId, ref:"User", required: false }, // à renseigner quand cela concerne un user
    agenda: { type: Schema.Types.ObjectId, ref:"Agenda", required: false} , // à renseigner quand c'est une notification en rapport avec la création d'un agenda
    type: { type: Number, required: true }, // quel type de notification c'est 0 = création d'un agenda, 1 = ajout d'un rdv, 2 = modif rdv, 3 = supprimer rdv, 4 = ajout à un nouvel agenda partagé, 5 = retiré d'un agenda partagé
    seen: { type: Boolean, default: false }, // si la notification a été vue par l'utilisateur
    nom: { type: String, required: false } // Utilisable pour l'affichage des notifications, surtout de suppression, parce que on perd le nom sinon

}, { timestamps: true });

export const NotificationModel = mongoose.model("Notification", notificationSchema);