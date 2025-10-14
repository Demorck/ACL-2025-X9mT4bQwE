import express from "express";
import path from "path";
import expressLayouts from "express-ejs-layouts";

import { fileURLToPath } from "url";
import { routeCalendar } from "./routes/calendar.js";
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

app.get("/appointment/new", routeNewAppointment)

app.post("/appointment/add", routeAddAppointmentToDatabase);

app.get("/daily", routeDaily);
// Dans l'idée, quand vous ferez les users, faudra faire une route quand avec le POST pour créer un user, etc.
app.get("/user", async (req, res) => {
    await UserModel.create({
        nom: "Antoine",
        prenom: "Maximilien",
        email: "mail@gmail.com",
    });

    res.status(201).json({ message: "User created successfully" });
});


app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.use((error, req, res, next) => {
    res.render("error", { error: error }); 
    next();
});
