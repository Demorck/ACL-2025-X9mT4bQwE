import express from "express";
import { getNotificationsForUser, markAllNotificationsSeen, deleteAllNotifications, deleteSingleNotification } from "../../services/notificationService.js";

const router = express.Router();

/**
 * Récupère toutes les notifications
 * GET /api/notifications
 */
router.get("/", async (req, res, next) => {
    try {
        if (!res.locals.user) {
            return res.status(401).json({ success: false, error: "Non authentifié" });
        }

        const notifications = await getNotificationsForUser(res.locals.user);

        res.json({
            success: true,
            notifications
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/**
 * Marque une notification comme vue
 * POST /api/notifications/:id/seen
 */
router.post("/:id/seen", async (req, res, next) => {
    try {
        if (!res.locals.user) {
            return res.status(401).json({ success: false, error: "Non authentifié" });
        }

        await markAllNotificationsSeen(res.locals.user._id, req.params.id);

        res.json({
            success: true,
            message: "Notification marquée comme vue"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/**
 * Marque toutes les notifications comme vues
 * POST /api/notifications/all/seen
 */
router.post("/all/seen", async (req, res, next) => {
    console.log("res");
    try {
        if (!res.locals.user) {
            return res.status(401).json({ success: false, error: "Non authentifié" });
        }
        
        await markAllNotificationsSeen(res.locals.user._id);

        res.json({
            success: true,
            message: "Toutes les notifications ont été marquées comme vues"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/**
 * Supprime une notification
 * DELETE /api/notifications/:id
 */
router.delete("/:id", async (req, res, next) => {
    try {
        if (!res.locals.user) {
            return res.status(401).json({ success: false, error: "Non authentifié" });
        }

        await deleteSingleNotification(req.params.id);

        res.json({
            success: true,
            message: "Notification supprimée"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/**
 * Supprime toutes les notifications
 * DELETE /api/notifications/all
 */
router.delete("/all/delete", async (req, res, next) => {
    try {
        if (!res.locals.user) {
            return res.status(401).json({ success: false, error: "Non authentifié" });
        }

        await deleteAllNotifications(res.locals.user._id);

        res.json({
            success: true,
            message: "Toutes les notifications ont été supprimées"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

export default router;