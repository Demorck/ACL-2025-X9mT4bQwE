import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import engine from "ejs-mate";

import { routeCalendar } from "./routes/calendar.js";
import { routeRegister } from "./routes/register.js";
import { routeLogin, login } from "./routes/login.js";
import { routesCreateAccount } from "./routes/register.js";
import { routeDaily } from "./routes/daily.js";
import { routeNewAppointment, routeAddAppointmentToDatabase } from "./routes/newAppointment.js";
import { authMiddleware } from "./middlewares/auth.js";
import { routeLogOut } from "./routes/logout.js";
import { routeNewAgenda, routeAddAgendaToDatabase, routeListeAgendas, routeDeleteAgenda, routeEditAgenda, routeFormEditAgenda, routeTestAgendasPartages, routeAjouterAgendaPartage, routeSupprimerAgendaPartage } from "./routes/agendas.js";
import { routeWeekly } from "./routes/weekly.js";
import { routeMarkAllNotificationsSeen, routeNotification } from "./routes/notifications.js";
import { routeAddModif, routeModif, routeDelete } from "./routes/appointmentModif.js";
import { notificationMiddleware } from "./middlewares/notification.js";
import { mergeRenderOptionsMiddleware } from "./middlewares/render.js";
import { routeRecherche } from "./routes/rechercher/recherches.js";

import { editUserProfile, routeShowProfile } from "./routes/accounts/userProfile.js";

import { utiliserlien, routeCreationInvitation} from "./routes/invitations.js"

export const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.join(__dirname, "../public");

// Chemin et initialisation des views (avec l'EJS)
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());

app.locals._layoutFile = "template/layout";

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
app.get("/hello", (req, res) => {
    res.json("Hello world, tout ça");
});

app.get("/agendas/new", routeNewAgenda);
app.post("/agendas/add", routeAddAgendaToDatabase)

app.get("/agendas/list", routeListeAgendas);
app.get("/agendas/delete/:id", routeDeleteAgenda);
app.get("/agendas/edit/:id", routeFormEditAgenda);
app.post("/agendas/edit/:id", routeEditAgenda);
app.get("/agendas/testAgendasPartages", routeTestAgendasPartages);
app.post("/AjoutAgendaPartage", routeAjouterAgendaPartage);
app.post("/RemoveAgendaPartage", routeSupprimerAgendaPartage);


app.get("/register", routeRegister);
app.post("/register", routesCreateAccount);

app.get("/login", routeLogin);
app.post("/login", login);
app.get("/logout", routeLogOut);

app.get("/appointment/new", routeNewAppointment)
app.post("/appointment/add", routeAddAppointmentToDatabase);

app.post("/rdv/supp", routeDelete);
app.post("/rdv/modif", routeModif);

app.get("/daily", routeDaily);
app.get("/week", routeWeekly);

app.get("/notifications", routeNotification);
app.post("/appointment/del", routeDelete);
app.post("/appointment/modif", routeModif);
app.post("/notifications/all-seen", routeMarkAllNotificationsSeen);

app.get("/profile", routeShowProfile)
app.use(editUserProfile)

app.post("/modif", routeAddModif);

app.get("/calendar/:view", routeCalendar);

app.use("/api/rechercher", routeRecherche);

// app.post("/invitation/creer", creerLien);
app.get("/invitation/:token", utiliserlien);

app.get("/invitation/:idAgenda/creer", routeCreationInvitation);


app.get("/", (req, res) => {
    res.render("index");
});

app.use(function(req, res, next) {
    res.status(404);
    res.render('errors/404', { url: req.url });
});


