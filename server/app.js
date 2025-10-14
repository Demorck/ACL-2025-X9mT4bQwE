import express from "express";
import { fileURLToPath } from "url";
import { routeCalendar } from "./routes/calendar.js";
import { routeRegister } from "./routes/register.js";
import { routesCreateAccount } from "./routes/register.js";
import { UserModel } from "./database/users.js";
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

app.get("/account", routeRegister);
app.post("/account", routesCreateAccount);

// Dans l'idée, quand vous ferez les users, faudra faire une route quand avec le POST pour créer un user, etc.
/* app.get("/user", async (req, res) => {
    await UserModel.create({
        nom: "Antoine",
        prenom: "Maximilien",
        email: "mail@gmail.com",
    });

    res.status(201).json({ message: "User created successfully" });
}); */

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).send("Erreur interne du serveur");
    next();
});
