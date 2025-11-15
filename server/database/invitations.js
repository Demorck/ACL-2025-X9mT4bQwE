import mongoose from "mongoose";
import { AgendaModel } from "./agenda.js";

const Schema = mongoose.Schema;

const invitationsSchema = new Schema({
    agenda : { type: Schema.Types.ObjectId, ref: "Agenda", required: true },
    token: { type: String, required: true, unique: true,index: true },
    utilisationsMax: { type: Number,default: null},
    nbUtilisation: { type: Number, default: 0, min: 0}
});

export const invitationsModel = mongoose.model("invitations", invitationsSchema);