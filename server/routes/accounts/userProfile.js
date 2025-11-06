import { UserModel } from "../../database/users.js"

export async function routeShowProfile(req, res) {
    if (!res.locals.user)
        res.redirect("/login")

    res.render("accounts/profile", {
        user: res.locals.user
    })
}