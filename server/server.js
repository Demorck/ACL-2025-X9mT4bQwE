import { app } from "./app.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});


let mongoDB = "mongodb://127.0.0.1:27017/acl";

if (process.env.DB_PORT && process.env.DB_HOST) {
  mongoDB = process.env.DB_HOST + ":" + process.env.DB_PORT;
  mongoDB = process.env.DATABASE_NAME ? mongoDB + "/" + process.env.DATABASE_NAME : mongoDB;
}

main()
  .then(() => console.log(`MongoDB connecté sur ${mongoDB}`))
  .catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}
