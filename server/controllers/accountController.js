import * as userService from "../services/accountService.js";

/** Affichage des formulaires */
export function showRegisterForm(req, res) {
    res.render("accounts/register");
}

export function showLoginForm(req, res) {
    res.render("accounts/login");
}

export async function logoutUser(req, res, next) {
    try {
        res.clearCookie("token");
        const token = req.cookies?.token;
        if (token) {
            await userService.logoutUser(token);
        }
        res.redirect("/login");
    } catch(err) {
        next(err);
    }
}

export function showProfileForm(req, res) {
    if(!res.locals.user) return res.redirect("/login");

    res.render("accounts/profile", { user: res.locals.user });
}

/** Actions POST */
export async function createAccount(req, res, next) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.render("accounts/register", { error: "Veuillez remplir tous les champs." });
        }

        const user = await userService.createUser({ username, password });

        res.redirect("/login");
    } catch(err) {
        next(err);
    }
}

export async function loginUser(req, res, next) {
    try {
        const { username, password } = req.body;
        const user = await userService.authenticateUser({ username, password });

        if (!user) return res.render("accounts/login", { exist: false });

        const token = await userService.createSession(user);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24
        });

        res.redirect("/calendar/week");
    } catch(err) {
        next(err);
    }
}

/** Modifier profil */
export async function editProfile(req, res, next) {
    try {
        if(!res.locals.user) return res.redirect("/login");

        await userService.updateProfile(res.locals.user._id, req.body, req.file);
        res.redirect("/profile");
    } catch(err) {
        next(err);
    }
}

/** Modifier thème */
export async function editTheme(req, res, next) {
    try {
        if(!res.locals.user) return res.status(401).json({ message: "Utilisateur non authentifié" });

        await userService.updateTheme(res.locals.user._id, req.body.theme);
        res.json({ message: "Thème mis à jour avec succès" });
    } catch(err) {
        next(err);
    }
}
