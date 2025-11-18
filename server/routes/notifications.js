import express from "express";
import { routeNotification, routeMarkAllNotificationsSeen, routeMarkSingleNotificationsSeen, routeDeleteAllNotifications, routeDeleteSingleNotification } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", routeNotification);

router.post("/single-seen", routeMarkSingleNotificationsSeen);
router.post("/all-seen", routeMarkAllNotificationsSeen);

router.post("/single-delete", routeDeleteSingleNotification);
router.post("/all-delete", routeDeleteAllNotifications);

export default router;
