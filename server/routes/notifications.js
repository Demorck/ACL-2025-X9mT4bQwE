import express from "express";
import { routeNotification } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", routeNotification);

export default router;
