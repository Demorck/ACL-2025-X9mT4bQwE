import mongoose from "mongoose";
import { ajouterNotification } from "./users.js";

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
    if(agenda)
    {
        const userIds = new Set();
        if (agenda.user) {
            const ownerId = agenda.user._id ? agenda.user._id.toString() : agenda.user.toString();
            userIds.add(ownerId);
        }
        if (agenda.invites && agenda.invites.length > 0) {
            agenda.invites.forEach(id => userIds.add(id.toString()));
        }

        const usersToNotify = await mongoose.model("User").find({ _id: { $in: Array.from(userIds) } });

        for (const userDoc of usersToNotify) {
            const notification = new NotificationModel({
                user: userDoc,
                appointment: appointment,
                agenda: agenda,
                type: type,
            });
            await notification.save();
            await ajouterNotification(userDoc, notification);
        }
    }else
    {
        // Cas où il n'y a pas d'agenda (ne devrait pas arriver pour les rdv, mais par sécurité)
        const notification = new NotificationModel({
                user: user,
                appointment: appointment,
                agenda: agenda,
                type: type,
            });
        await notification.save();
        await ajouterNotification(user, notification);
    }
}

/**
 * Supprime toute les notifications en lien avec l'appointement en paramètre
 * @param {id de l'appointment qui a été supprimé} appointmentId 
 */
export async function supprimerNotification(appointmentId) {
    try {
        await NotificationModel.deleteMany({appointment: appointmentId});
    } catch (err) {
        console.error("Erreurs lors de la suppresion des notifications : ", err);
    }
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
