import { NotificationModel, getNotificationsForUser } from "../database/notification.js";

export async function routeNotification(req, res) {
    if(!res.locals.user)
        return res.redirect("/login");

    // populations des notifications de l'utilisateur depuis mongoose
    const notifications = await getNotificationsForUser(res.locals.user);

    // renvoie vers la page des notifications avec toute les notifications en parametre
    res.render("notifications/notifications", {
        notifications,
        user : res.locals.user
    });
}

/**
 * Fonction qui marque comme "lue" toute les notifications de l'utilisateur
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export async function routeMarkAllNotificationsSeen(req, res) {
    if(!res.locals.user)
        return res.redirect("/login");

    // met à true la variable "seen" dans la bdd
    await NotificationModel.updateMany(
        { user: res.locals.user._id, seen: false },
        { $set: { seen: true } }
    );

    res.redirect("/notifications");
}

/**
 * Fonction qui supprime toute les notifications de l'utilisateur
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export async function routeDeleteAllNotifications(req, res) {
    if(!res.locals.user)
        return res.redirect("/login");

    // supprime toute les notifications de l'utilisateur
    await NotificationModel.deleteMany(
        { user: res.locals.user._id}
    )
    res.redirect("/notifications");
}

/**
 * Fonction qui supprime une notification (en utilisant l'id passé par méthode POST, voir server/view/notifications/notifications.ejs)
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export async function routeDeleteSingleNotification(req, res) {
    if(!res.locals.user)
        return res.redirect("/login");

    // Récupère l'id de la notification
    const {id} = req.body;

    // Supprime la notification avec l'id récupéré
    await NotificationModel.deleteOne(
        {_id: id}
    )
    res.redirect("/notifications");
}