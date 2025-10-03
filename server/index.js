const express = require("express");
const path = require("path");

const app = express();
const PORT = 25565;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../client")));

app.get("/hello", (req, res) => {
    res.json("Hello world, tout ça");
});

// const routes_dir = require("./routes/");


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
