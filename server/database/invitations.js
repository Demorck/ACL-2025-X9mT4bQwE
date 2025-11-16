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

export async function creerInvitation(agendaId, utilisationsMax) {
    const token = new mongoose.Types.ObjectId().toString();

    const invitation = await invitationsModel.create({
        agenda: agendaId,
        token,
        utilisationsMax
    });

    return invitation;
}

export async function ajouterUtilisation(token) {
    await invitationsModel.findOneAndUpdate(
        { token },
        { $inc: { nbUtilisation: 1 } },
        { new: true }
    );
}

export async function getInvitationByAgendaId(agendaId) {
    return await invitationsModel.findOne({ agenda: agendaId });
}
