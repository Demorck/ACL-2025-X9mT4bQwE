import express from "express";
import { createAppointment, updateAppointment, deleteAppointment } from "../../services/appointmentService.js";

const router = express.Router();

/**
 * Créée un rendez-vous
 * POST /api/appointments
 */
router.post("/", async (req, res, next) => {
    try {
        if (!res.locals.user) {
            return res.status(401).json({ success: false, error: "Non authentifié" });
        }

        const appointment = await createAppointment(res.locals.user, req.body);

        res.json({
            success: true,
            message: "Rendez-vous créé avec succès",
            appointment
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/**
 * Modifie un rendez-vous
 * PUT /api/appointments/:id
 */
router.put("/:id", async (req, res, next) => {
    try {
        if (!res.locals.user) {
            return res.status(401).json({ success: false, error: "Non authentifié" });
        }

        const updated = await updateAppointment(res.locals.user, req.body);

        res.json({
            success: true,
            message: "Rendez-vous modifié avec succès",
            appointment: updated
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/**
 * Supprime un rendez-vous
 * DELETE /api/appointments/:id
 */
router.delete("/:id", async (req, res, next) => {
    try {
        if (!res.locals.user) {
            return res.status(401).json({ success: false, error: "Non authentifié" });
        }

        await deleteAppointment(res.locals.user, req.body);

        res.json({
            success: true,
            message: "Rendez-vous supprimé avec succès"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

export default router;