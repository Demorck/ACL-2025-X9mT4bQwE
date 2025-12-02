import { creerInvitation, ajouterUtilisation, getInvitationByAgendaId, getInvitation, updateInvitation} from "../database/invitations.js";
import { AgendaModel } from "../database/agenda.js";
import { addInvite, removeInvite, isInviteInAgenda, getInvites, getNiveauUser, changeRole } from "../database/invite_agenda.js"
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
    
    await addInvite(agenda._id, userId, 1);
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

    const invites = await getInvites(agenda._id);
    for (let invite of invites) {
        // On vérifie que l'utilisateur associé à l'invitation existe toujours
        if (invite) {
            invite.niveau = await getNiveauUser(agenda._id, invite._id);
        }
    }

    const niveau = await getNiveauUser(req.params.idAgenda, res.locals.user._id)

    res.render("modals/agendas/invitations", { 
        lien,
        invitation,
        invites,
        title: "Gérer les invitations",
        niveau,
    });
}

export async function supprimerInvite(req, res){
    await removeInvite(req.params.idAgenda, req.params.userId);
    res.redirect(req.get("referer"));
}

export async function changerRoleInvite(req, res, next){
    const { userId, agendaId, role } = req.body;


    if (!role) {
        return res.render('errors/generic', { message: "Informations manquantes pour changer le rôle.", statusCode: 400 });
    }

    const user = await UserModel.findById(userId); 
    const agenda = await AgendaModel.findById(agendaId);
    if (!user) {
        return res.render('errors/generic', { message: "Cet user n'existe pas", statusCode: 400 });
    }
    if(!agenda)
    {
        return res.render('errors/generic', { message: "Cet agenda n'existe pas", statusCode: 400 });
    }
    if(role < 1 || role > 4)
    {
        return res.render('errors/generic', { message: "Ce rôle n'existe pas", statusCode: 400 });
    }

    await changeRole(agendaId, userId, role);
    return res.redirect(req.get("referer"));

}

export async function modifierInvitation(req, res) {
    await updateInvitation(req.body.idInvitation, req.body);
    return res.redirect(req.get("referer"));
}
