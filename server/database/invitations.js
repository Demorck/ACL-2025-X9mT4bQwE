import mongoose from "mongoose";
import { addInvite } from "./agenda.js";

const Schema = mongoose.Schema;

const invitationsSchema = new Schema({
    agenda: { type: Schema.Types.ObjectId, ref: "Agenda", required: true },
    utilisationsMax: { type: Number, default: null },
    nbUtilisation: { type: Number, default: 0, min: 0 }
});

export const invitationsModel = mongoose.model("invitations", invitationsSchema);

export async function creerInvitation(agendaId, utilisationsMax) {
    const invitation = await invitationsModel.create({
        agenda: agendaId,
        utilisationsMax
    });

    
    return invitation;
}

export async function ajouterUtilisation(invitationId) {
    await invitationsModel.findByIdAndUpdate(
        invitationId,
        { $inc: { nbUtilisation: 1 } },
        { new: true }
    );
}

export async function getInvitationByAgendaId(agendaId) {
    return await invitationsModel.findOne({ agenda: agendaId });
}

export async function getInvitation(id) {
    return await invitationsModel.findById(id);
}

export async function updateInvitation(idInvitation, data) {
    return invitationsModel.updateOne(
        { _id: idInvitation },
        { $set: data }
    );
}
