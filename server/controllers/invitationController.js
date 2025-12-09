import * as invitationService from "../services/invitationService.js";
import { getInvitation } from "../database/invitations.js";

/**
 * Utilise un lien d'invitation pour rejoindre un agenda
 */
export async function useInvitationLink(req, res, next) {
    try {
        if (!res.locals.user) {
            return res.redirect("/login");
        }

        const result = await invitationService.useInvitationLink(
            res.locals.user,
            req.params.id
        );

        if (!result.success) {
            return res.status(result.statusCode || 400).render('errors/generic', { 
                message: result.error,
                statusCode: result.statusCode || 400
            });
        }

        res.redirect(result.redirect);
    } catch (error) {
        next(error);
    }
}

/**
 * Affiche le formulaire de création d'invitation
 */
export async function showCreateInvitationForm(req, res, next) {
    try {
        if (!res.locals.user) {
            return res.redirect("/login");
        }

        res.render("modals/invitations/creation", { 
            agendaId: req.params.idAgenda,
            title: "Creation lien"
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Crée une nouvelle invitation
 */
export async function createInvitation(req, res, next) {
    try {
        if (!res.locals.user) {
            return res.redirect("/login");
        }

        await invitationService.createInvitation(
            req.params.idAgenda,
            req.body
        );

        res.redirect(`/invitation/${req.params.idAgenda}/manage`);
    } catch (error) {
        next(error);
    }
}

/**
 * Affiche la page de gestion des invitations
 */
export async function showInvitationManagement(req, res, next) {
    try {
        if (!res.locals.user) {
            return res.redirect("/login");
        }

        const data = await invitationService.getInvitationManagementData(
            req.params.idAgenda,
            res.locals.user._id
        );

        if (!data) {
            return res.status(404).render('errors/generic', {
                message: "Agenda introuvable",
                statusCode: 404
            });
        }

        res.render("modals/invitations/invitations", { 
            agenda: data.agenda,
            invitations: data.invitations,
            invites: data.invites,
            title: "Gérer les invitations",
            niveau: data.niveau,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Affiche le formulaire de modification d'invitation
 */
export async function showEditInvitationForm(req, res, next) {
    try {
        if (!res.locals.user) {
            return res.redirect("/login");
        }

        const invitation = await getInvitation(req.params.idInvitation);
        
        if (!invitation) {
            return res.status(404).render('errors/generic', {
                message: "Invitation introuvable",
                statusCode: 404
            });
        }

        res.render("modals/invitations/modification", { 
            invitation,
            title: "modification invitation"
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Met à jour une invitation
 */
export async function updateInvitationDetails(req, res, next) {
    try {
        if (!res.locals.user) {
            return res.redirect("/login");
        }

        const result = await invitationService.updateInvitationDetails(
            req.params.idInvitation,
            req.body
        );

        if (!result.success) {
            return res.status(result.statusCode || 400).render('errors/generic', {
                message: result.error,
                statusCode: result.statusCode || 400
            });
        }

        res.redirect(`/invitation/${result.agendaId}/manage`);
    } catch (error) {
        next(error);
    }
}

/**
 * Supprime une invitation
 */
export async function deleteInvitationLink(req, res, next) {
    try {
        if (!res.locals.user) {
            return res.redirect("/login");
        }

        const result = await invitationService.deleteInvitationLink(
            req.params.idInvitation
        );

        if (!result.success) {
            return res.status(result.statusCode || 400).render('errors/generic', {
                message: result.error,
                statusCode: result.statusCode || 400
            });
        }
        
        res.redirect(`/invitation/${result.agendaId}/manage`);
    } catch (error) {
        next(error);
    }
}

/**
 * Retire un utilisateur d'un agenda
 */
export async function removeUserFromAgenda(req, res, next) {
    try {
        if (!res.locals.user) {
            return res.redirect("/login");
        }

        await invitationService.removeUserFromAgenda(
            req.params.idAgenda,
            req.params.userId
        );
        
        res.redirect(req.get("referer") || "/agendas/list");
    } catch (error) {
        next(error);
    }
}

/**
 * Change le rôle d'un utilisateur dans un agenda
 */
export async function changeUserRole(req, res, next) {
    try {
        if (!res.locals.user) {
            return res.redirect("/login");
        }

        const result = await invitationService.changeUserRole(req.body);

        if (!result.success) {
            return res.status(result.statusCode || 400).render('errors/generic', { 
                message: result.error,
                statusCode: result.statusCode || 400
            });
        }
        
        res.redirect(req.get("referer") || "/agendas/list");
    } catch (error) {
        next(error);
    }
}