import { UserModel } from "../database/users.js";

export async function routeNotification(req, res) {
    if(!res.locals.user)
        return res.redirect("/login");

    const user = await UserModel.findById(res.locals.user._id).populate("notifications");

    if(!user)
        return res.status(400).send("Aucun utilisateur trouvé");

    const allNotifications =  user.notifications;

    res.render("notifications/notifications", {
        notifications: allNotifications,
    });
}