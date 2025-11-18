import mongoose from "mongoose";
import { NotificationModel } from "../database/notification.js";
import { ajouterNotification } from "../database/users.js";

/**
 * Renvoie toutes les notifications d’un utilisateur
 */
export async function getNotificationsForUser(user) {
    return await NotificationModel.find({ user: user._id })
        .populate("appointment", "nom")
        .populate("agenda", "nom")
        .populate("user_concerned", "username")
        .sort({ createdAt: -1 });
}

/**
 * Marque toutes les notifications comme vues
 */
export async function markAllNotificationsSeen(userId, notificationId = null) {
    if (notificationId) {
        return await NotificationModel.updateOne(
            { _id: notificationId, user: userId, seen: false },
            { $set: { seen: true } }
        );
    } else {
        return await NotificationModel.updateMany(
            { user: userId, seen: false },
            { $set: { seen: true } }
        );
    }
}

/**
 * Supprime toutes les notifications d’un utilisateur
 */
export async function deleteAllNotifications(userId) {
    return await NotificationModel.deleteMany({ user: userId });
}

/**
 * Supprime une notification par ID
 */
export async function deleteSingleNotification(notificationId) {
    return await NotificationModel.deleteOne({ _id: notificationId });
}

/**
 * Cette fonction créée une notification et l'ajoute dans la bdd
 * @param {User} user 
 * @param {Appointment} appointment 
 * @param {User} user_concerned
 * @param {Agenda} agenda 
 * @param {Number} type 
 */
export async function creerNotification(user, appointment, user_concerned, agenda, type) {

    let nomGenerique = appointment ? appointment.nom : agenda?.nom;

    if (agenda) {
        const userIds = new Set();

        if (agenda.user) {
            const ownerId = agenda.user._id ? agenda.user._id.toString() : agenda.user.toString();
            userIds.add(ownerId);
        }

        if (agenda.invites?.length) {
            agenda.invites.forEach(id => userIds.add(id.toString()));
        }

        const usersToNotify = await mongoose.model("User").find({
            _id: { $in: Array.from(userIds) }
        });

        for (const userDoc of usersToNotify) {
            const notification = new NotificationModel({
                user: userDoc,
                appointment,
                user_concerned,
                agenda,
                type,
                nom: nomGenerique
            });
            await notification.save();
            await ajouterNotification(userDoc, notification);
        }
    } else {
        const notification = new NotificationModel({
            user,
            appointment,
            user_concerned,
            agenda,
            type,
            nom: nomGenerique
        });
        await notification.save();
        await ajouterNotification(user, notification);
    }
}

/**
 * Supprime les notifications liées à un rendez-vous supprimé
 */
export async function supprimerNotification(appointmentId) {
    return await NotificationModel.deleteMany({
        appointment: appointmentId,
        type: { $ne: 3 }
    });
}
