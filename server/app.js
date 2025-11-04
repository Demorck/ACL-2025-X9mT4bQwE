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
import { routeMarkAllNotificationsSeen, routeNotification } from "./routes/notifications.js";
import { routeAjouterModif, routeModif } from "./routes/appointmentModif.js";
import { routeModifDelete } from "./routes/appointmentModif.js";
import { notificationMiddleware } from "./middlewares/notification.js";
import { getAgendasForUser } from "./database/agenda.js";
import { getAppointmentsByUserAndDateRange } from "./database/appointment.js";
import { arrangeAppointmentsInColumns, normalizeAppointment } from "./utils/appointment.js";
import { TZDate } from "@date-fns/tz";
import { formatDate, getFirstDayOfMonth, getFirstDayOfWeek } from "./utils/date.js";
import { mergeRenderOptionsMiddleware } from "./middlewares/render.js";



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

app.get("/calendar/:view", async (req, res) => {
    const view = req.params.view || "week";
    let agendas = await getAgendasForUser(res.locals.user);

    async function getData(startDate, endDate) {
        let appointments = await getAppointmentsByUserAndDateRange(res.locals.user, startDate, endDate);
        appointments = normalizeAppointment(appointments, startDate, endDate);
        appointments = arrangeAppointmentsInColumns(appointments);

        let startLabel = formatDate(startDate, "dd/MM/yyyy");
        let endLabel = formatDate(endDate, "dd/MM/yyyy");

        let days = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            days.push(new Date(d));
        }

        let daysLabels = days.map(d => formatDate(d, "eee, dd/MM"));
        return {
            startLabel,
            endLabel,
            agendas,
            days: daysLabels,
            appointments
        };
    }

    let data = { agendas };
    let title = "";
    switch(view) {
        case "day":
            let today = new Date();
            data = await getData(
                new TZDate(today.getFullYear(), today.getMonth(), today.getDate()),
                new TZDate(today.getFullYear(), today.getMonth(), today.getDate() + 1)
            );
            title = "Jour du " + data.startLabel;
            break;
        case "week":
            data = await getData(
                getFirstDayOfWeek(new Date(), { weekStartsOn: 1 }),
                new Date(new Date().setDate(new Date().getDate() + 7 - new Date().getDay()))
            );
            title = "Semaine du " +  data.startLabel + " au " + data.endLabel;
            break;
        case "month":
            data = await getData(
                getFirstDayOfMonth(new Date()),
                new Date(new Date().setMonth(new Date().getMonth() + 1))
            );
            title = "Mois de " + data.startLabel;
            break;
        default:
            return res.status(404).send("Vue non trouvée");
    }

    // Rendu du layout principal
    res.render(`calendar/views/${view}`, {
        title,
        view,
        data
    });
});

app.get("/", (req, res) => {
  res.render("index");
});

app.use((error, req, res, next) => {
    res.render("error", { error: error }); 
    next();
});

