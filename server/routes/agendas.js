import { creerAgenda, listAgendas, deleteAgenda, getAgendasById, editAgenda } from "../database/agenda.js";


export async function routeNewAgenda(req, res) { 

    if(!res.locals.user)
        return res.redirect("/login");

    res.render("agendas/newAgenda", {
        
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
    const agendas = await listAgendas(res.locals.user);
    res.render('agendas/listAgendas', { agendas });
}

export async function routeDeleteAgenda(req, res, next) {

    if (!res.locals.user)
        return res.redirect("/login");

    await deleteAgenda(res.locals.user, req.params.id);
    return res.redirect("/agendas/list");

}

export async function routeEditAgenda(req, res, next) {
    await editAgenda(req.params.id, req.body.nom, req.body.description, req.body.couleur);
    return res.redirect("/agendas/list");
}

export async function routeFormEditAgenda(req, res, next){  
    const agenda = await getAgendasById(req.params.id)
    res.render('agendas/editAgenda', { agenda });
}





