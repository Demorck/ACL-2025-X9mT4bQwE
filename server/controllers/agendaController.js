import { getAgendasById, getAgendasForUser } from "../database/agenda.js";
import { getNiveauUser } from "../database/invite_agenda.js";

/**
 * Affiche le formulaire de création d'un nouvel agenda.
 */
export async function showNewAgendaForm(req, res) { 

    if(!res.locals.user)
        return res.redirect("/login");

    res.render("modals/agendas/form", {
        title: "Créer un nouvel agenda",
        agenda: {
            nom: "",
            description: "",
            couleur: "red"
        },
        buttonText: "Créer",
        action: "/agendas/add"
    });
}


/**
 * Liste tous les agendas de l'utilisateurs
 */
export async function showAgendas(req, res, next) {
    const agendas = await getAgendasForUser(res.locals.user);
    
    await Promise.all(agendas.map(async (agenda) => {
            agenda.niveau = await getNiveauUser(agenda._id, res.locals.user._id);
        }));

    res.render('agendas/listAgendas', 
        { 
            agendas : agendas,
            user : res.locals.user,
        }
    );
}

/**
 * Affiche le formulaire d'édition d'un agenda
 */
export async function showEditFormAgendas(req, res, next){  
    const agenda = await getAgendasById(req.params.id)
    res.render('modals/agendas/form', { 
        agenda,
        title: "Modifier l'agenda",
        buttonText: "Modifier",
        action: `/agendas/edit/${req.params.id}`
    });
}


/**
 * Affiche le formulaire d'export d'un agenda
 */
export async function showFormExportAgenda(req, res){
    const agenda = await getAgendasById(req.params.id);
    res.render('modals/agendas/export', { 
        agenda,
        title: "Exporter l'agenda",
        buttonText: "Exporter",
        action: `/agendas/export/${req.params.id}`
    });
}

/**
 * Affiche le formulaire d'import d'un agenda
 */
export async function showFormImportAgenda(req, res){
    const agenda = await getAgendasById(req.params.id)
    res.render('modals/agendas/import', { 
        agenda,
        title: "Importer un agenda",
        buttonText: "Importer",
        action: "/agendas/import/"
    });
}