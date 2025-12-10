import { 
    creerInvitation, 
    ajouterUtilisation, 
    getInvitationsByAgendaId, 
    getInvitation, 
    updateInvitation, 
    deleteInvitation 
} from "../database/invitations.js";
import { AgendaModel } from "../database/agenda.js";
import { 
    addInvite, 
    removeInvite, 
    isInviteInAgenda, 
    getInvites, 
    getNiveauUser, 
    changeRole 
} from "../database/invite_agenda.js";
import { UserModel } from "../database/users.js";

/**
 * Valide et utilise un lien d'invitation
 * @param {Object} user - L'utilisateur qui utilise le lien
 * @param {String} invitationId - L'ID de l'invitation
 * @returns {Object} - { success: boolean, error?: string, redirect?: string }
 */
export async function useInvitationLink(user, invitationId) {
    const userId = user._id;
    const invitation = await getInvitation(invitationId);
    
    if (!invitation) {
        return {
            success: false,
            error: "Invitation introuvable",
            statusCode: 404
        };
    }

    const agenda = invitation.agenda;
    
    // Vérifier si l'utilisateur est le propriétaire
    if (agenda.user && agenda.user._id.toString() === userId.toString()) {
        return {
            success: false,
            error: "Vous êtes le propriétaire de cet agenda",
            statusCode: 400
        };
    }

    // Vérifier si l'utilisateur est déjà dans l'agenda
    const isInAgenda = await isInviteInAgenda(agenda, userId);
    if (isInAgenda) {
        return {
            success: false,
            error: "Vous êtes déjà dans cet agenda",
            statusCode: 400
        };
    }
    
    // Vérifier l'expiration
    if (invitation.dateExpiration && new Date() > new Date(invitation.dateExpiration)) {
        return {
            success: false,
            error: "Ce lien d'invitation a expiré",
            statusCode: 400
        };
    }

    // Vérifier le nombre d'utilisations
    if (invitation.utilisationsMax && invitation.nbUtilisation >= invitation.utilisationsMax) {
        return {
            success: false,
            error: "Ce lien a atteint son nombre maximum d'utilisations",
            statusCode: 400
        };
    }

    // Ajouter l'utilisateur à l'agenda
    await addInvite(agenda._id, userId, 1);
    await ajouterUtilisation(invitationId);

    return {
        success: true,
        redirect: "/agendas"
    };
}

/**
 * Crée une nouvelle invitation pour un agenda
 * @param {String} agendaId - L'ID de l'agenda
 * @param {Object} invitationData - Les données de l'invitation
 * @returns {Object} - L'invitation créée
 */
export async function createInvitation(agendaId, invitationData) {
    const { utilisationsMax, dateExpiration } = invitationData;

    const max = utilisationsMax ? parseInt(utilisationsMax) : null;
    const expiration = dateExpiration ? new Date(dateExpiration) : null;

    const invitation = await creerInvitation(agendaId, max, expiration);
    
    return invitation;
}

/**
 * Récupère toutes les informations pour gérer les invitations d'un agenda
 * @param {String} agendaId - L'ID de l'agenda
 * @param {String} userId - L'ID de l'utilisateur qui consulte
 * @returns {Object} - { agenda, invitations, invites, niveau }
 */
export async function getInvitationManagementData(agendaId, userId) {
    const agenda = await AgendaModel.findById(agendaId);
    
    if (!agenda) {
        return null;
    }

    const invites = await getInvites(agenda._id);
    
    // Enrichir les invités avec leurs informations utilisateur et niveau
    for (let invite of invites) {
        if (invite) {
            invite.user = await UserModel.findById(invite.user);
            invite.niveau = await getNiveauUser(agenda._id, invite.user);
        }
    }

    const niveau = await getNiveauUser(agendaId, userId);
    const invitations = await getInvitationsByAgendaId(agendaId);

    return {
        agenda,
        invitations,
        invites,
        niveau
    };
}

/**
 * Met à jour une invitation
 * @param {String} invitationId - L'ID de l'invitation
 * @param {Object} updateData - Les données à mettre à jour
 * @returns {Object} - { success: boolean, agendaId: string }
 */
export async function updateInvitationDetails(invitationId, updateData) {
    const invitation = await getInvitation(invitationId);
    
    if (!invitation) {
        return {
            success: false,
            error: "Invitation introuvable",
            statusCode: 404
        };
    }

    const { utilisationsMax, dateExpiration } = updateData;
    
    const data = {
        utilisationsMax: utilisationsMax ? parseInt(utilisationsMax) : null,
        dateExpiration: dateExpiration ? new Date(dateExpiration) : null
    };

    await updateInvitation(invitationId, data);

    return {
        success: true,
        agendaId: invitation.agenda._id
    };
}

/**
 * Supprime une invitation
 * @param {String} invitationId - L'ID de l'invitation
 * @returns {Object} - { success: boolean, agendaId: string }
 */
export async function deleteInvitationLink(invitationId) {
    const invitation = await getInvitation(invitationId);
    
    if (!invitation) {
        return {
            success: false,
            error: "Invitation introuvable",
            statusCode: 404
        };
    }

    await deleteInvitation(invitationId);
    
    return {
        success: true,
        agendaId: invitation.agenda._id
    };
}

/**
 * Retire un utilisateur d'un agenda
 * @param {String} agendaId - L'ID de l'agenda
 * @param {String} userId - L'ID de l'utilisateur à retirer
 * @returns {Object} - { success: boolean }
 */
export async function removeUserFromAgenda(agendaId, userId) {
    await removeInvite(agendaId, userId);
    
    return {
        success: true
    };
}

/**
 * Change le rôle d'un utilisateur dans un agenda
 * @param {Object} roleData - Les données du changement de rôle
 * @returns {Object} - { success: boolean, error?: string }
 */
export async function changeUserRole(roleData) {
    const { userId, agendaId, role } = roleData;

    if (!role) {
        return {
            success: false,
            error: "Informations manquantes pour changer le rôle.",
            statusCode: 400
        };
    }

    const user = await UserModel.findById(userId);
    const agenda = await AgendaModel.findById(agendaId);
    
    if (!user) {
        return {
            success: false,
            error: "Cet utilisateur n'existe pas",
            statusCode: 400
        };
    }
    
    if (!agenda) {
        return {
            success: false,
            error: "Cet agenda n'existe pas",
            statusCode: 400
        };
    }
    
    const roleNum = parseInt(role);
    if (roleNum < 1 || roleNum > 4) {
        return {
            success: false,
            error: "Ce rôle n'existe pas",
            statusCode: 400
        };
    }

    await changeRole(agendaId, userId, roleNum);
    
    return {
        success: true
    };
}