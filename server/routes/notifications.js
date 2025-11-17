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

export async function routeMarkAllNotificationsSeen(req, res) {
    if(!res.locals.user)
        return res.redirect("/login");

    await NotificationModel.updateMany(
        { user: res.locals.user._id, seen: false },
        { $set: { seen: true } }
    );

    res.redirect("/notifications");
}

export async function routeDeleteAllNotifications(req, res) {
    if(!res.locals.user)
        return res.redirect("/login");

    await NotificationModel.deleteMany(
        { user: res.locals.user._id}
    )
    res.redirect("/notifications");
}