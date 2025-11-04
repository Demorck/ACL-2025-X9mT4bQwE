import express from "express";
import path from "path";
import expressLayouts from "express-ejs-layouts";
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
import { routeNewAgenda, routeAddAgendaToDatabase, routeListeAgendas, routeDeleteAgenda, routeEditAgenda, routeFormEditAgenda} from "./routes/agendas.js";
import { routeWeekly } from "./routes/weekly.js";
import { routeNotification } from "./routes/notifications.js";
import { routeAddModif, routeModif, routeDelete } from "./routes/appointmentModif.js";
import { routeMarkAllNotificationsSeen, routeNotification } from "./routes/notifications.js";
import { routeModif } from "./routes/appointmentModif.js";
import { routeModifDelete } from "./routes/appointmentModif.js";
import { notificationMiddleware } from "./middlewares/notification.js";
import { getAgendasForUser } from "./database/agenda.js";
import { getAppointmentsByUserAndDateRange } from "./database/appointment.js";
import { arrangeAppointmentsInColumns, normalizeAppointment } from "./utils/appointment.js";
import { formatDate, getFirstDayOfMonth, getFirstDayOfWeek } from "./utils/date.js";
import { mergeRenderOptionsMiddleware } from "./middlewares/render.js";
import { getDayData, getMonthData, getWeekData } from "./models/appointment.js";
import { TZDate } from "@date-fns/tz";



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
    .use(express.urlencoded({ extended: false }));

// Middlewares
app.use(authMiddleware);
app.use(notificationMiddleware);
app.use(mergeRenderOptionsMiddleware);

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

app.get("/register", routeRegister);
app.post("/register", routesCreateAccount);

app.get("/login", routeLogin);
app.post("/login", login);
app.get("/logout", routeLogOut);

app.get("/appointment/new", routeNewAppointment)
app.post("/appointment/add", routeAddAppointmentToDatabase);
app.post("/rdv/supp", routeModifDelete);
app.post("/rdv/modif", routeModif);

app.get("/daily", routeDaily);
app.get("/week", routeWeekly);

app.get("/notifications", routeNotification);
app.post("/appointment/del", routeDelete);
app.post("/appointment/modif", routeModif);
app.post("/notifications/all-seen", routeMarkAllNotificationsSeen);

app.post("/modif", routeAddModif);

app.get("/calendar/:view", routeCalendar);

app.get("/", (req, res) => {
    res.render("index");
});

app.use(function(req, res, next) {
    res.status(404);
    res.render('errors/404', { url: req.url });
});

