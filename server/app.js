import express from "express";
import path from "path";
import expressLayouts from "express-ejs-layouts";

import { fileURLToPath } from "url";
import { routeCalendar } from "./routes/calendar.js";
import { routeRegister } from "./routes/register.js";
import { routeLogin, login } from "./routes/login.js";
import { routesCreateAccount } from "./routes/register.js";
import { routeDaily } from "./routes/daily.js";
import { UserModel } from "./database/users.js";
import { routeNewAppointment, routeAddAppointmentToDatabase } from "./routes/newAppointment.js";


export const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.join(__dirname, "../public");

// Chemin et initialisation des views (avec l'EJS)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "template/layout");



// Chemin du dossier public pour les fichiers statiques, du json et des formulaires.
app
    .use(express.static(publicPath))
    .use(express.json())
    .use(express.urlencoded({ extended: false }));


// Routes    
app.get("/hello", (req, res) => {
    res.json("Hello world, tout ça");
});

app.get("/agendas", routeCalendar);

app.get("/account", routeRegister);
app.post("/account", routesCreateAccount);

app.get("/login", routeLogin);

app.post('/login', login);


app.get("/appointment/new", routeNewAppointment)

app.post("/appointment/add", routeAddAppointmentToDatabase);

app.get("/daily", routeDaily);


app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.use((error, req, res, next) => {
    res.render("error", { error: error }); 
    next();
});

