import { UserModel } from "../database/users.js";

export async function authMiddleware(req, res, next) {
    const token = req.cookies?.token;
    
    if (!token) {
        res.locals.user = null;
        return next();
    }

    try {
        const user = await UserModel.findOne({ token });
        if (user) {
            res.locals.user = user;
        } else {
            res.locals.user = null;
        }
    } catch (_) {
        res.locals.user = null;
    }

    next();
}
