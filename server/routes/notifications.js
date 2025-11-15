import { NotificationModel } from "../database/notification.js";

export async function routeNotification(req, res) {
    if(!res.locals.user)
        return res.redirect("/login");

    // populations des notifications de l'utilisateur depuis mongoose
    const notifications = await NotificationModel.find({
        user: res.locals.user._id
    })
        .populate("appointment agenda")
        .sort({ createdAt: -1 });

    // renvoie vers la page des notifications avec toute les notifications en parametre
    res.render("notifications/notifications", {
        notifications,
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