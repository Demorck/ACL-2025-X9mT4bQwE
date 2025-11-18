import express from "express";
import { routeNotification, routeMarkAllNotificationsSeen, routeDeleteAllNotifications, routeDeleteSingleNotification } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", routeNotification);
router.post("/all-seen", routeMarkAllNotificationsSeen);
router.post("/all-delete", routeDeleteAllNotifications);
router.post("/single-delete", routeDeleteSingleNotification);

export default router;
