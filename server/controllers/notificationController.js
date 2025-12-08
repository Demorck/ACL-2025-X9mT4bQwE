import { getNotificationsForUser} from "../services/notificationService.js";

export async function routeNotification(req, res) {
    if (!res.locals.user)
        return res.redirect("/login");

    const notifications = await getNotificationsForUser(res.locals.user);

    res.render("notifications/notifications", {
        notifications,
        user: res.locals.user
    });
}