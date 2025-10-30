import { UserModel } from "../database/users.js";

export async function routeNotification(req, res) {
    if(!res.locals.user)
        return res.redirect("/login");

    // populations des notifications de l'utilisateur depuis mongoose
    const user = await UserModel.findById(res.locals.user._id).populate("notifications");

    // Vérifications si l'utilisateur est bien créée
    if(!user)
        return res.status(400).send("Aucun utilisateur trouvé"); // bon message d'erreur ?

    const allNotifications =  user.notifications;

    // renvoie vers la page des notifications avec toute les notifications en parametre
    res.render("notifications/notifications", {
        notifications: allNotifications,
    });
}