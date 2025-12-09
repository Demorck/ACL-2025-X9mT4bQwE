import { creerInvitation, ajouterUtilisation, getInvitationsByAgendaId, getInvitation, updateInvitation, deleteInvitation } from "../database/invitations.js";
import { AgendaModel } from "../database/agenda.js";
import { addInvite, removeInvite, isInviteInAgenda, getInvites, getNiveauUser, changeRole } from "../database/invite_agenda.js"
import { UserModel } from "../database/users.js"


export async function routeCreationInvitation(req, res) {
    const agendaId = req.params.idAgenda;
    const { utilisationsMax, dateExpiration } = req.body;

    const max = utilisationsMax ? parseInt(utilisationsMax) : null;

    const expiration = dateExpiration ? new Date(dateExpiration) : null;

    await creerInvitation(agendaId, max, expiration);
    res.render("modals/invitations/invitations", { 
        agendaId: req.params.idAgenda,
        title: "Invitation"
    });

    return res.redirect(`/invitation/${agendaId}/manage`);
}

export async function routeFormCreationInvitation(req, res) {
    res.render("modals/invitations/creation", { 
        agendaId: req.params.idAgenda,
        title: "Creation lien"
    });
}

export async function routeFormModificationInvitation(req, res) {
    const invitation = await getInvitation(req.params.idInvitation);
    res.render("modals/invitations/modification", { 
        invitation: invitation,
        title: "modification invitation"
    });
}

export async function routeModificationInvitation(req, res) {
    const invitationId = req.params.idInvitation;
    const agendaId = (await getInvitation(invitationId)).agenda._id; 
    const { utilisationsMax, dateExpiration } = req.body;
    const data = {
        utilisationsMax: utilisationsMax ? parseInt(utilisationsMax) : null,
        dateExpiration: dateExpiration ? new Date(dateExpiration) : null
    };

    await updateInvitation(invitationId, data);


    return res.redirect(`/invitation/${agendaId}/manage`);
}

export async function routeInvitation(req, res){
    const agenda = await AgendaModel.findById(req.params.idAgenda);

    const invites = await getInvites(agenda._id);
    for (let invite of invites) {
        // On vérifie que l'utilisateur associé à l'invitation existe toujours
        if (invite) {
            invite.user = await UserModel.findById(invite.user);
            invite.niveau = await getNiveauUser(agenda._id, invite.user);
        }
    }

    const niveau = await getNiveauUser(req.params.idAgenda, res.locals.user._id)

    const invitations = await getInvitationsByAgendaId(req.params.idAgenda);

    res.render("modals/invitations/invitations", { 
        agenda,
        invitations,
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


export async function routeSuppressionInvitation(req, res){
    const invitation = await getInvitation(req.params.idInvitation);
    console.log(invitation);
    await deleteInvitation(req.params.idInvitation);
    return res.redirect(`/invitation/${invitation.agenda._id}/manage`);
}