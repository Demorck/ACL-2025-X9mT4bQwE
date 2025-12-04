import { creerInvitation, ajouterUtilisation, getInvitationsByAgendaId, getInvitation, updateInvitation} from "../database/invitations.js";
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

    return res.redirect("/invitation/:agendaId/manage");
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

    // console.log(agendaId.agenda._id);

    return res.redirect(`/invitation/${agendaId}/manage`);
}

export async function routeInvitation(req, res){
    const agenda = await AgendaModel.findById(req.params.idAgenda);

    const invites = await Promise.all(
        agenda.invites.map(id =>
            UserModel.findById(id).select("username _id").lean()
        )
    );

    const invitations = await getInvitationsByAgendaId(req.params.idAgenda);

    console.log(invitations);

    res.render("modals/invitations/invitations", { 
        agenda,
        invitations,
        invites,
        title: "Gérer les invitations"
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


