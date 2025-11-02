import express from "express";
import path from "path";
import expressLayouts from "express-ejs-layouts";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

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
import { routeMarkAllNotificationsSeen, routeNotification } from "./routes/notifications.js";
import { routeAjouterModif, routeModif } from "./routes/appointmentModif.js";
import { routeModifDelete } from "./routes/appointmentModif.js";
import { notificationMiddleware } from "./middlewares/notification.js";



export const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.join(__dirname, "../public");

// Chemin et initialisation des views (avec l'EJS)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(cookieParser());
app.set("layout", "template/layout");



// Chemin du dossier public pour les fichiers statiques, du json et des formulaires.
app
    .use(express.static(publicPath))
    .use(express.json())
    .use(express.urlencoded({ extended: false }));

// Middlewares
app.use(authMiddleware);
app.use(notificationMiddleware);

// Routes    
app.get("/hello", (req, res) => {
    res.json("Hello world, tout ça");
});

app.get("/agendas", routeCalendar);
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
app.post("/notifications/all-seen", routeMarkAllNotificationsSeen);

app.post("/modif", routeAjouterModif);


app.get("/", (req, res) => {
  res.render("index");
});

app.use((error, req, res, next) => {
    res.render("error", { error: error }); 
    next();
});

