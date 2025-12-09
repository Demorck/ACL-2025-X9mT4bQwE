import express from "express";
import * as invitationService from "../../services/invitationService.js";

const router = express.Router();

/**
 * Récupère les données de gestion des invitations d'un agenda
 * GET /api/invitations/:agendaId
 */
router.get("/:agendaId", async (req, res, next) => {
    try {
        if (!res.locals.user) {
            return res.status(401).json({ success: false, error: "Non authentifié" });
        }

        const data = await invitationService.getInvitationManagementData(
            req.params.agendaId,
            res.locals.user._id
        );

        if (!data) {
            return res.status(404).json({ 
                success: false, 
                error: "Agenda introuvable" 
            });
        }

        res.json({
            success: true,
            ...data
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/**
 * Crée une nouvelle invitation
 * POST /api/invitations/:agendaId
 */
router.post("/:agendaId", async (req, res, next) => {
    try {
        if (!res.locals.user) {
            return res.status(401).json({ success: false, error: "Non authentifié" });
        }

        const invitation = await invitationService.createInvitation(
            req.params.agendaId,
            req.body
        );

        res.json({
            success: true,
            message: "Invitation créée avec succès",
            invitation
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
});

/**
 * Met à jour une invitation
 * PUT /api/invitations/:invitationId
 */
router.put("/:invitationId", async (req, res, next) => {
    try {
        if (!res.locals.user) {
            return res.status(401).json({ success: false, error: "Non authentifié" });
        }

        const result = await invitationService.updateInvitationDetails(
            req.params.invitationId,
            req.body
        );

        if (!result.success) {
            return res.status(result.statusCode || 400).json({
                success: false,
                error: result.error
            });
        }

        res.json({
            success: true,
            message: "Invitation modifiée avec succès",
            agendaId: result.agendaId
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
});

/**
 * Supprime une invitation
 * DELETE /api/invitations/:invitationId
 */
router.delete("/:invitationId", async (req, res, next) => {
    try {
        if (!res.locals.user) {
            return res.status(401).json({ success: false, error: "Non authentifié" });
        }

        const result = await invitationService.deleteInvitationLink(
            req.params.invitationId
        );

        if (!result.success) {
            return res.status(result.statusCode || 400).json({
                success: false,
                error: result.error
            });
        }

        res.json({
            success: true,
            message: "Invitation supprimée avec succès",
            agendaId: result.agendaId
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/**
 * Retire un utilisateur d'un agenda
 * DELETE /api/invitations/:agendaId/members/:userId
 */
router.delete("/:agendaId/members/:userId", async (req, res, next) => {
    try {
        if (!res.locals.user) {
            return res.status(401).json({ success: false, error: "Non authentifié" });
        }

        await invitationService.removeUserFromAgenda(
            req.params.agendaId,
            req.params.userId
        );

        res.json({
            success: true,
            message: "Utilisateur retiré avec succès"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/**
 * Change le rôle d'un utilisateur dans un agenda
 * PATCH /api/invitations/:agendaId/members/:userId/role
 */
router.patch("/:agendaId/members/:userId/role", async (req, res, next) => {
    try {
        if (!res.locals.user) {
            return res.status(401).json({ success: false, error: "Non authentifié" });
        }

        const result = await invitationService.changeUserRole({
            userId: req.params.userId,
            agendaId: req.params.agendaId,
            role: req.body.role
        });

        if (!result.success) {
            return res.status(result.statusCode || 400).json({
                success: false,
                error: result.error
            });
        }

        res.json({
            success: true,
            message: "Rôle modifié avec succès"
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
});

export default router;