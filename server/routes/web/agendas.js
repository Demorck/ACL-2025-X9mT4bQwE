import express from "express";
import * as agendaController from "../../controllers/agendaController.js";

const router = express.Router();

// Page des agendas
router.get("/", agendaController.showAgendas);

// Formulaires
router.get("/new", agendaController.showNewAgendaForm);
router.get("/edit/:id", agendaController.showEditFormAgendas);
router.get("/export/:id", agendaController.showFormExportAgenda);
router.get("/import/", agendaController.showFormImportAgenda);


export default router;