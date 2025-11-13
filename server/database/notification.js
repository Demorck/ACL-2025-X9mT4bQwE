import mongoose from "mongoose";
import {ajouterNotification} from "./users.js";

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref:"User", required: true}, // user lié à la notification
    appointment: { type: Schema.Types.ObjectId, ref:"Appointment", required: false}, // à renseigner quand c'est une notification en rapport avec un rdv
    agenda: { type: Schema.Types.ObjectId, ref:"Agenda", required: false}, // à renseigner quand c'est une notification en rapport avec la création d'un agenda
    type: { type: Number, required: true}, // quel type de notification c'est 0 = création d'un agenda, 1 = ajout d'un rdv, 2 = modif rdv, 3 = supprimer rdv, 4 = ajout à un nouvel agenda partagé, 5 = retiré d'un agenda partagé  
    seen: { type: Boolean, default: false } // si la notification a été vue par l'utilisateur
}, { timestamps: true });

export const NotificationModel = mongoose.model("Notification", notificationSchema);

/**
 * Cette fonction créée un notification et l'ajoute d'une notification
 * @param {User} user 
 * @param {Appointment} appointment 
 * @param {Agenda} agenda 
 * @param {Number} type 
 */
export async function creerNotification(user, appointment, agenda, type) {
    const notification = new NotificationModel({
        user: user,
        appointment: appointment,
        agenda: agenda,
        type: type,
    });
    await notification.save();

    await ajouterNotification(user, notification);
}

/**
 * Renvoie la liste des notifications d'un user
 * @param {User} user 
 * @returns 
 */
export async function getNotificationsForUser(user) {
    const notificationUserIds = user.notifications;
    const notificationPromises = notificationUserIds.map(notificationId => NotificationModel.findById(notificationId));
    const notifications = await Promise.all(notificationPromises);
    const validNotifications = notifications.filter(notification => notification !== null);

    return validNotifications;
}
