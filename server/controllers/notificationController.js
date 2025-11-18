import { getNotificationsForUser, markAllNotificationsSeen, deleteAllNotifications, deleteSingleNotification } from "../services/notificationService.js";

export async function routeNotification(req, res) {
    if (!res.locals.user)
        return res.redirect("/login");

    const notifications = await getNotificationsForUser(res.locals.user);

    res.render("notifications/notifications", {
        notifications,
        user: res.locals.user
    });
}

export async function routeMarkSingleNotificationsSeen(req, res) {
    if (!res.locals.user)
        return res.redirect("/login");

    const { id } = req.body;

    await markAllNotificationsSeen(res.locals.user._id, id);
    res.redirect("/notifications");
}

export async function routeMarkAllNotificationsSeen(req, res) {
    if (!res.locals.user)
        return res.redirect("/login");

    await markAllNotificationsSeen(res.locals.user._id);
    res.redirect("/notifications");
}

export async function routeDeleteAllNotifications(req, res) {
    if (!res.locals.user)
        return res.redirect("/login");

    await deleteAllNotifications(res.locals.user._id);
    res.redirect("/notifications");
}

export async function routeDeleteSingleNotification(req, res) {
    if (!res.locals.user)
        return res.redirect("/login");

    const { id } = req.body;

    await deleteSingleNotification(id);
    res.redirect("/notifications");
}
