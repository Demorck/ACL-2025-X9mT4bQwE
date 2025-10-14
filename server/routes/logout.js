import { UserModel } from "../database/users.js";

export async function routeLogOut(req, res) {
    try {
        res.clearCookie("token");

        const token = req.cookies?.token;
        if (!token) {
            return res.redirect("/");
        }

        const user = await UserModel.findOne({ token });
        if (user) {
            user.token = "";
            await user.save();
        }

        res.redirect("/login");
    } catch (error) {
        console.error("Erreur lors de la déconnexion :", error);
        res.status(500).send("Erreur serveur lors de la déconnexion");
    }
}