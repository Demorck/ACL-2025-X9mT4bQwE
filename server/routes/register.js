import { UserModel, ajouterAgendaParDefaut } from "../database/users.js";

export function routeLogin(req, res) {
    res.render("accounts/login");
}

export function routeRegister(req, res) {
    res.render("accounts/register");
}

export async function routesCreateAccount(req, res){
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send("Nom d'utilisateur et mot de passe requis");
        }

        let userExists = await UserModel.findOne({ username });
        if (userExists) {
            return res.status(400).send("Nom d'utilisateur déjà pris");
        }

        let newUser = new UserModel({ username, password });
        await newUser.save();

        ajouterAgendaParDefaut(newUser);

        res.redirect("/agendas");
    } catch (error) {
        res.status(500).send("Erreur serveur");
        console.error(error);
    }
}