import express from "express";
import * as invitationController from "../../controllers/invitationController.js";

const router = express.Router();

router.get("/:id", invitationController.useInvitationLink);

// Formulaires
router.get("/:idAgenda/create", invitationController.showCreateInvitationForm);
router.get("/:idInvitation/edit", invitationController.showEditInvitationForm);
router.get("/:idAgenda/manage", invitationController.showInvitationManagement);


export default router;