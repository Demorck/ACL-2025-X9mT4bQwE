import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token: { type: String, default: "" },
});

export const UserModel = mongoose.model("User", UserSchema);