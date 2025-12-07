import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import engine from "ejs-mate";

import { routeCalendar } from "./routes/calendar.js";
import accountRoute from "./routes/account.js";
import appointmentRoute from "./routes/appointments.js";
import notificationRoute from "./routes/notifications.js";
import apiCalendarRoute from "./routes/api/calendar.js";
import apiAppointmentRoute from "./routes/api/appointments.js";
import apiNotificationRoute from "./routes/api/notifications.js";
import { authMiddleware } from "./middlewares/auth.js";
import { routeNewAgenda, routeAddAgendaToDatabase, routeListeAgendas, routeDeleteAgenda, routeEditAgenda, routeFormEditAgenda, routeTestAgendasPartages, routeAjouterAgendaPartage, routeSupprimerAgendaPartage } from "./routes/agendas.js";

import { notificationMiddleware } from "./middlewares/notification.js";
import { mergeRenderOptionsMiddleware } from "./middlewares/render.js";
import { routeRecherche } from "./routes/rechercher/recherches.js";

import { utiliserlien, routeCreationInvitation, supprimerInvite, modifierInvitation, changerRoleInvite} from "./routes/invitations.js"

export const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.join(__dirname, "../public");

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

// Agenda routes
app.get("/agendas/new", routeNewAgenda);
app.post("/agendas/add", routeAddAgendaToDatabase)

app.get("/agendas/list", routeListeAgendas);
app.get("/agendas/delete/:id", routeDeleteAgenda);
app.get("/agendas/edit/:id", routeFormEditAgenda);
app.post("/agendas/edit/:id", routeEditAgenda);

app.get("/appointment/confirmationSuppression?rdvId=<%= rdvId %>")

app.get("/calendar/:view", routeCalendar);

app.use("/api/rechercher", routeRecherche);


// app.post("/invitation/modifier", modifierLien);
app.get("/invitation/:idAgenda/remove/:userId", supprimerInvite);
app.post("/invitation/changeRole", changerRoleInvite);
app.get("/invitation/:idAgenda/manage", routeCreationInvitation);
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


