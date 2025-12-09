import express from "express";
import path from "path";
import multer from 'multer';
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import engine from "ejs-mate";

import { routeCalendar } from "./routes/web/calendar.js";
import accountRoute from "./routes/web/account.js";
import appointmentRoute from "./routes/web/appointments.js";
import notificationRoute from "./routes/web/notifications.js";

import apiCalendarRoute from "./routes/api/calendar.js";
import apiAppointmentRoute from "./routes/api/appointments.js";
import apiNotificationRoute from "./routes/api/notifications.js";
import apiAgendaRoute from "./routes/api/agendas.js";
import apiSearchRoute from "./routes/api/search.js";
import agendasRoute from "./routes/web/agendas.js";
import { authMiddleware } from "./middlewares/auth.js";

import { notificationMiddleware } from "./middlewares/notification.js";
import { mergeRenderOptionsMiddleware } from "./middlewares/render.js";

import { utiliserlien, routeCreationInvitation, supprimerInvite, modifierInvitation, changerRoleInvite, routeInvitation, 
    routeFormCreationInvitation, routeFormModificationInvitation, routeModificationInvitation, routeSuppressionInvitation} from "./routes/invitations.js"

export const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.join(__dirname, "../public");
const upload = multer({storage: multer.memoryStorage()});

// Chemin et initialisation des views (avec l'EJS)
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());

// Chemin du dossier public pour les fichiers statiques, du json et des formulaires.
app
    .use(express.static(publicPath))
    .use(express.json())
    .use(express.urlencoded({ extended: true }));

// Middlewares
app.use(mergeRenderOptionsMiddleware);
app.use(authMiddleware);
app.use(notificationMiddleware);


// Routes

// User routes
app.use(accountRoute)

// Appointment routes
app.use("/appointment", appointmentRoute);

// Notification routes
app.use("/notifications", notificationRoute);

// API routes
app.use("/api/calendar/", apiCalendarRoute);
app.use("/api/appointments/", apiAppointmentRoute);
app.use("/api/notifications/", apiNotificationRoute);
app.use("/api/agendas", apiAgendaRoute);
app.use("/api/search", apiSearchRoute);


app.get("/calendar/:view", routeCalendar);
app.use("/agendas", agendasRoute);



app.get("/invitation/:idAgenda/remove/:userId", supprimerInvite);
app.post("/invitation/changeRole", changerRoleInvite);
app.get("/invitation/:idAgenda/manage", routeInvitation);

app.get("/invitation/:idAgenda/create", routeFormCreationInvitation);
app.post("/invitation/:idAgenda/create", routeCreationInvitation);

app.get("/invitation/:idInvitation/edit", routeFormModificationInvitation);
app.post("/invitation/:idInvitation/edit", routeModificationInvitation);

app.get("/invitation/:idInvitation/delete", routeSuppressionInvitation);

app.get("/invitation/:id", utiliserlien);
app.post("/invitation/modifier", modifierInvitation);

app.post("/erreur", (req, res) => {
    res.render("errors/generic", { message: req.body.message || "Une erreur est survenue." });
});

app.get("/", (req, res) => {
    res.render("index");
});

app.use(function(req, res, next) {
    res.status(404);
    res.render('errors/404', { url: req.url });
});


