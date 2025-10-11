import express from "express";
import { fileURLToPath } from "url";
import { getMonthData } from "./models/calendar.js";
import { routeCalendar } from "./routes/calendar.js";
export const app = express();

// Chemin et initialisation des views (avec l'EJS)
app.set("views", fileURLToPath(new URL("./views", import.meta.url)));
app.set("view engine", "ejs");

// Chemin du dossier public pour les fichiers statiques, du json et des formulaires.
app
    .use(express.static(fileURLToPath(new URL("./public", import.meta.url))))
    .use(express.json())
    .use(express.urlencoded({ extended: false }));


// Routes    
app.get("/hello", (req, res) => {
    res.json("Hello world, tout ça");
});

app.get("/", (req, res) => {
  res.sendFile(new URL(publicPath, "index.html"));
});

app.get("/agendas", routeCalendar);

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).send("Erreur interne du serveur");
    next();
});
