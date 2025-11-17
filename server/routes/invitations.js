import { creerInvitation, ajouterUtilisation, getInvitationByAgendaId, getInvitation, updateInvitation} from "../database/invitations.js";
import { AgendaModel, addInvite, isInviteInAgenda, removeInvite } from "../database/agenda.js";
import { UserModel } from "../database/users.js"

export async function utiliserlien(req, res) {
    const invitationId = req.params.id;
    const userId = res.locals.user._id;
    const invitation = await getInvitation(invitationId);
    const agenda = invitation.agenda;

    if (agenda.user && agenda.user.toString() === userId.toString()) {
        return res.status(400).send("Vous etes le proprietaire de cet agenda");
    }

    const isInAgenda = await isInviteInAgenda(agenda, userId);
    
    if (isInAgenda) {
        return res.status(400).send("Vous etes deja dans cet agenda");
    }
    
    await addInvite(agenda._id, userId);
    await ajouterUtilisation(invitationId);

    return res.redirect("/calendar/week");
}

export async function routeCreationInvitation(req, res){
    const agenda = await AgendaModel.findById(req.params.idAgenda);
    let invitation = await getInvitationByAgendaId(agenda._id);

    if (!invitation) {
        invitation = await creerInvitation(agenda._id, 1);
    }

    const lien = `${req.protocol}://${req.get("host")}/invitation/${invitation._id}`;

    const invites = await Promise.all(
        agenda.invites.map(id =>
            UserModel.findById(id).select("username _id").lean()
        )
    );

    res.render("invitations/invitation", { 
        lien,
        invitation,
        invites
    });
}

export async function supprimerInvite(req, res){
    await removeInvite(req.params.idAgenda, req.params.userId);
    res.redirect(req.get("referer"));
}

export async function modifierInvitation(req, res) {
    await updateInvitation(req.body.idInvitation, req.body);
    return res.redirect(req.get("referer"));
}
