import { creerInvitation, ajouterUtilisation, getInvitationByAgendaId } from "../database/invitations.js";
import { AgendaModel } from "../database/agenda.js";

export async function utiliserlien(req, res) {
    await ajouterUtilisation(req.body.agendaId, req.body.utilisationsMax);
    return res.redirect("/calendar/week")
}

export async function routeCreationInvitation(req, res){
    const agenda = await AgendaModel.findById(req.params.idAgenda);
    let invitation = await getInvitationByAgendaId(agenda._id);

    if (!invitation) {
        invitation = await creerInvitation(agenda._id, 1);
    }

    console.log(invitation);

    const lien = `${req.protocol}://${req.get("host")}/invitation/${invitation.token}`;
    res.render("invitations/invitation", { 
        lien,
        invitation
    });
}