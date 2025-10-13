import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
});

export const UserModel = mongoose.model("User", UserSchema);