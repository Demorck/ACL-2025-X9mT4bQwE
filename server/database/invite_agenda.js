import mongoose from "mongoose";

import { creerNotification } from "../services/notificationService.js";
import { AgendaModel } from "./agenda.js";

const Schema = mongoose.Schema;

// TODO: Ajouter les dates en index pour accélérer les recherches.
const inviteAgendaSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    agenda: {type: Schema.Types.ObjectId, ref: "Agenda", required: true},
    niveau: {type: Number, required: true, default:0 }
    // 0 : même pas présent, 1: Viewer, 2: Member, 3: Admin, 4: Propriétaire
});

export const InviteAgendaModel = mongoose.model("inviteAgenda", inviteAgendaSchema);


export async function peutSupprimerRDV(agendaId, userId)
{
    const status = await InviteAgendaModel.findOne({
        agenda: agendaId,
        user: userId
    });
    if (!status) return false;
    return status.niveau >= 3;
}

export async function peutModifierRDV(agendaId, userId)
{
    const status = await InviteAgendaModel.findOne({
        agenda: agendaId,
        user: userId
    });
    if (!status) return false;
    return status.niveau >= 2;
}

export async function peutVoirRDV(agendaId, userId)
{
    const status = await InviteAgendaModel.findOne({
        agenda: agendaId,
        user: userId
    });
    return status ? status.niveau >= 1 : false;
}

export async function addInvite(agendaId, userId, niveau) {
    const agenda = await AgendaModel.findById(agendaId);
    if (!agenda) {
        console.error(`addInvite: Agenda non trouvé avec l'ID ${agendaId}`);
        return;
    }

    const user = await mongoose.model("User").findById(userId);
    if (!user) {
        console.error(`addInvite: Utilisateur non trouvé avec l'ID ${userId}`);
        return;
    }

    const status = await InviteAgendaModel.findOne({
        agenda: agenda,
        user: user
    });

    if (status) {
        status.niveau = niveau;
        await status.save();
    } else {
    
    const invite = new InviteAgendaModel({
            user: user,
            agenda: agenda,
            niveau: niveau
        });
    await invite.save();
    }

    await creerNotification(user, undefined, user, agenda, 4);
}

export async function removeInvite(agendaId, userId){
    const agenda = await AgendaModel.findById(agendaId);
    if (!agenda) {
        console.error(`removeInvite: Agenda non trouvé avec l'ID ${agendaId}`);
        return;
    }
    const user = await mongoose.model("User").findById(userId);
    if (!user) {
        console.error(`removeInvite: Utilisateur non trouvé avec l'ID ${userId}`);
        return;
    }

    const status = await InviteAgendaModel.findOne({
        agenda: agenda,
        user: user
    });

    status.niveau = 0;
    await status.save();
    await creerNotification(user, undefined, user, agenda, 5);
}

export async function getInvites(agendaId){
    const invitesId = await InviteAgendaModel.find({
        agenda: agendaId,
        niveau: { $gt: 0 }
    });
    const invites = Promise.all(invitesId.map(async (invite) => {
        return await mongoose.model("User").findById(invite.user);
    }));
    return invites;
}

export async function getInvitesAvecNiveau(agendaId,niveau){
    const invitesId = await InviteAgendaModel.find({
        $and:
        [
            {agenda: agendaId},
            {niveau: niveau}
        ]
    });
    const invites = Promise.all(invitesId.map(async (invite) => {
        return await mongoose.model("User").findById(invite.user);
    }));

    return invites;
}

export async function isInviteInAgenda(agendaId, userId){
    const status = await InviteAgendaModel.findOne({
        agenda: agendaId,
        user: userId
    });

    if(status && status.niveau > 0){
        return true;
    }else{
        return false;
    }
}

export async function getAgendasIdFromUserInvited(userId)
{
    const agendasId = await InviteAgendaModel.find({
        user: userId,
        niveau: { $gt: 0 }
    });

    // const agendas = Promise.all(agendasId.map(async (agenda) => {
    //     return await mongoose.model("Agenda").findById(agenda.agenda);
    // }));

    return agendasId;

}