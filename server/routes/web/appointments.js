import express from "express";
import { renderEditAppointment, renderNewAppointment, handleCreateAppointment, handleUpdateAppointment, handleDeleteAppointment } from "../../controllers/appointmentController.js";

const router = express.Router();

// GET
router.get("/new", renderNewAppointment);
router.post("/edit", renderEditAppointment);


// POST
router.post("/add", handleCreateAppointment);
router.post("/update", handleUpdateAppointment);
router.post("/delete", handleDeleteAppointment);
 
export default router;