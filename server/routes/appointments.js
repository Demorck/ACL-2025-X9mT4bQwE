import express from "express";
import { renderEditAppointment, renderNewAppointment } from "../controllers/appointmentController.js";

const router = express.Router();

// GET
router.get("/new", renderNewAppointment);
router.post("/edit", renderEditAppointment);

export default router;