import { NotificationModel } from "../database/notification.js";

export async function notificationMiddleware(req, res, next) {
    if (!res.locals.user) {
        res.locals.notificationCount = 0;
    } else {
        let unseenCount = await NotificationModel.countDocuments({ 
            user: res.locals.user._id, 
            seen: false 
        });
        res.locals.notificationCount = unseenCount;
    }

    next();
}