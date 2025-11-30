import { creerAgenda, listAgendas, deleteAgenda, getAgendasById, editAgenda, getAgendasForUser } from "../database/agenda.js";
import { addInvite, removeInvite } from "../database/invite_agenda.js";

export async function routeNewAgenda(req, res) { 

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

export async function routeAddAgendaToDatabase(req, res, next) {
    try {

        if(!res.locals.user)
            return res.redirect("/login");
        
        const { nom, description, couleur } = req.body;
        
        

        // Créer une nouvelle instance du modèle Agenda
        creerAgenda(res.locals.user, nom, description, couleur);


        // Rediriger l'utilisateur vers l'agenda
        res.redirect(`/calendar/week`);
    } catch (error) {
        next(error);
    }
}
export async function routeListeAgendas(req, res, next) {
    const agendas = await getAgendasForUser(res.locals.user);
    res.render('agendas/listAgendas', 
        { 
            agendas : agendas,
            user : res.locals.user,
        }
    );
}

export async function routeDeleteAgenda(req, res, next) {

    if (!res.locals.user)
        return res.redirect("/login");

    await deleteAgenda(res.locals.user, req.params.id);
    return res.redirect("/agendas/list");

}

export async function routeEditAgenda(req, res, next) {
    if (!res.locals.user)
        return res.redirect("/login");

    if (req.body.actionType === "Supprimer") {
        return res.redirect(`/agendas/delete/${req.params.id}`);
    }

    await editAgenda(req.params.id, req.body.nom, req.body.description, req.body.couleur);
    return res.redirect("/agendas/list");
}

export async function routeFormEditAgenda(req, res, next){  
    const agenda = await getAgendasById(req.params.id)
    res.render('modals/agendas/form', { 
        agenda,
        title: "Modifier l'agenda",
        buttonText: "Modifier",
        action: `/agendas/edit/${req.params.id}`
    });
}

export async function routeTestAgendasPartages(req, res){
    res.render('agendas/testAgendaPartages');
}

export async function routeAjouterAgendaPartage(req, res, bext){
    if(!res.locals.user)
        return res.redirect("/login");
    
    if(!req.body.agendaID || !req.body.userID)
    {
        console.log("Manque agendaID ou userID pour ajout");
        return res.redirect("/agendas/testAgendasPartages");
    }

    await addInvite(req.body.agendaID, req.body.userID,1);
    return res.redirect("/agendas/testAgendasPartages");
}

export async function routeSupprimerAgendaPartage(req, res, bext){
    if(!res.locals.user)
        return res.redirect("/login");
    
    if(!req.body.agendaID || !req.body.userID)
    {
        console.log("Manque agendaID ou userID pour suppression");
        return res.redirect("/agendas/testAgendasPartages");
    }

    await removeInvite(req.body.agendaID, req.body.userID);
    return res.redirect("/agendas/testAgendasPartages");
}
