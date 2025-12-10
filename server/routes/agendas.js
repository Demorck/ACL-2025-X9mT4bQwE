import { creerAgenda, listAgendas, deleteAgenda, getAgendasById, editAgenda, creerIcal, getAgendasForUser} from "../database/agenda.js";
import { creerRegleOccurrence } from "../database/regle_occurrence.js"
import { createAppointment } from "../database/appointment.js"
import ical from 'node-ical';
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
    // TODO : Faire passer les niveaux de permissions aux différents agendas
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

export async function routeFormExportAgenda(req, res){
    const agenda = await getAgendasById(req.params.id);
    res.render('modals/agendas/export', { 
        agenda,
        title: "Exporter l'agenda",
        buttonText: "Exporter",
        action: `/agendas/export/${req.params.id}`
    });
}

export async function routeExportAgenda(req, res, next) {
    if (!res.locals.user)
        return res.redirect("/login");

    const ical = await creerIcal(req.params.id);
    res.setHeader('Content-Disposition', 'attachment; filename="agenda.ics"');
    res.send(ical);
    return res.redirect("/agendas/list");
}

export async function routeFormImportAgenda(req, res){
    const agenda = await getAgendasById(req.params.id)
    res.render('modals/agendas/import', { 
        agenda,
        title: "Importer un agenda",
        buttonText: "Importer",
        action: "/agendas/import/"
    });
}

export async function routeImportAgenda(req, res){
    if (!res.locals.user) return res.redirect("/login");

    if (!req.body.nom) {
        return res.redirect("/agendas/list");
    }

    const agenda = await creerAgenda(
        res.locals.user,
        req.body.nom,
        req.body.description ?? '',
        req.body.couleur
    );

    const data = ical.sync.parseICS(req.file.buffer.toString('utf-8'));
    const frequences = { 3: "day1", 2: "week1", 1: "month1" };

    for (const i in data) {
        const event = data[i];
        
        if (event.type === 'VEVENT' && !event.recurrenceid) {
            
            let regle = null;
            if (event.rrule) {
                const frequence = frequences[event.rrule.options.freq];
                if (frequence){
                    const regleOccurence = await creerRegleOccurrence(
                        frequence,
                        event.rrule.options.until,
                        event.rrule.options.interval
                    );
                    regle = regleOccurence._id;
                }
            }

            const exceptionIds = [];
            
            if (event.recurrences) {
                for (const key in event.recurrences) {
                    const recEvent = event.recurrences[key];
                    
                    const newException = await createAppointment(
                        agenda._id,
                        recEvent.summary || event.summary,
                        recEvent.start,
                        recEvent.end,
                        res.locals.user._id,
                        null,
                        [],
                        [],           
                        true
                    );
                    
                    exceptionIds.push(newException._id);
                }
            }

            let exceptionDates = [];
            if (event.exdate) {
                exceptionDates = Object.values(event.exdate);
            }

            await createAppointment(
                agenda._id,
                event.summary || "Sans titre",
                event.start,
                event.end,
                res.locals.user._id,
                regle,
                exceptionIds,
                exceptionDates,
                false
            );
        }
    }
    return res.redirect("/agendas/list");
}