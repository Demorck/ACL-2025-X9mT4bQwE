import express from "express";
import { handleCreateAppointment, renderEditAppointment, renderNewAppointment, handleUpdateAppointment, handleDeleteAppointment, renderConfirmDeleteAppointment } from "../controllers/appointmentController.js";

const router = express.Router();

// GET
router.get("/new", renderNewAppointment);
router.post("/edit", renderEditAppointment);
router.get("/appointment/confirmationSuppression",renderConfirmDeleteAppointment)


// POST
router.post("/add", handleCreateAppointment);
router.post("/update", handleUpdateAppointment);
router.post("/delete", handleDeleteAppointment);
 
export default router;