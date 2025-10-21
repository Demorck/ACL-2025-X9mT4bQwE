import { creerAgenda } from "../database/agenda.js";


export async function routeNewAgenda(req, res) { 

    res.render("agendas/newAgenda", {
        
    });
}

export async function routeAddAgendaToDatabase(req, res, next) {
    try {
        const { nom, description, couleur } = req.body;
        

        // Créer une nouvelle instance du modèle Agenda
        creerAgenda(res.locals.user, nom, description, couleur);


        // Rediriger l'utilisateur vers l'agenda
        res.redirect(`/agendas`);
    } catch (error) {
        next(error);
    }
}