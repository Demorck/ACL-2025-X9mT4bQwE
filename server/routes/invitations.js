import { creerInvitation, ajouterIvitation } from "../database/invitations.js";

export async function creerLien(req, res) {
    const invitation = await creerInvitation(req.body.agendaId, req.body.utilisationsMax);
    res.status(201).json(invitation.token);
}

export async function utiliserlien(req, res) {
    await ajouterIvitation(req.body.agendaId, req.body.utilisationsMax);
    return res.redirect("/calendar/week")
}
