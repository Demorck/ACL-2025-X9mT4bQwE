import { creerInvitation, ajouterUtilisation, getInvitationByAgendaId, getInvitation, updateInvitation} from "../database/invitations.js";
import { AgendaModel, addInvite, isInviteInAgenda, removeInvite } from "../database/agenda.js";
import { UserModel } from "../database/users.js"

export async function utiliserlien(req, res) {
    const invitationId = req.params.id;
    const userId = res.locals.user._id;
    const invitation = await getInvitation(invitationId);
    const agenda = invitation.agenda;
    
    if (agenda.user && agenda.user._id.toString() === userId.toString()) {
        return res.render('errors/generic', { message: "Vous êtes le propriétaire de cet agenda", statusCode: 400 });
    }

    const isInAgenda = await isInviteInAgenda(agenda, userId);
    
    if (isInAgenda) {
        return res.render('errors/generic', { message: "Vous êtes déjà dans cet agenda", statusCode: 400 });
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

    res.render("modals/agendas/invitations", { 
        lien,
        invitation,
        invites,
        title: "Gérer les invitations",
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
