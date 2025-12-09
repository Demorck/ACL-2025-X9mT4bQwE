// services/appointmentService.js
import { AppointmentModel } from "../database/appointment.js";
import { RegleOccurrenceModel } from "../database/regle_occurrence.js";
import { peutAjouterRDV, peutModifierRDV, peutSupprimerRDV } from "../database/invite_agenda.js";
import { AgendaModel } from "../database/agenda.js";
import { creerNotification, supprimerNotification } from "../services/notificationService.js";
import { TZDate } from "@date-fns/tz";
import { formatDate, parseDate } from "../utils/date.js";



/**
 * Convertit champs date + heure en Date TZ
 */
export function buildDate(dateStr, timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    const d = new TZDate(dateStr);
    d.setHours(h, m, 0, 0);
    return d;
}


/**
 * Création d’un rendez-vous
 */
export async function createAppointment(user, body) {
    const {
        nom,
        date_debut,
        date_fin,
        heure_debut,
        heure_fin,
        agendas,
        recurrence,
        frequenceId,
        fin_rec,
        date_fin_rec
    } = body;

    const agenda = await AgendaModel.findById(agendas);
    if (!agenda) throw new Error("Agenda introuvable");


    //Vérifier si l'utilisateur peut ajouter le RDV :
    const hasPermissionAjouterRDV = await peutAjouterRDV(agenda._id, user._id)
    if(!hasPermissionAjouterRDV)
    {
        throw new Error("createAppointment : Vous n'êtes pas autorisé à ajouter un RDV à cet agenda");
    }


    // Construction des dates complètes
    const dateDebut = buildDate(date_debut, heure_debut);
    const dateFin = buildDate(date_fin, heure_fin);


    let regle = null;

    // Récurrence
    if (recurrence === "on") {
        regle = new RegleOccurrenceModel({
            frequence: frequenceId,
            date_fin: fin_rec === "never" ? null : new TZDate(date_fin_rec),
        });
        await regle.save();
    }

    // Création RDV
    const appointment = new AppointmentModel({
        agenda: agenda._id,
        nom,
        date_Debut: dateDebut,
        date_Fin: dateFin,
        recurrenceRule: regle?._id,
        createur: user._id,
    });

    await appointment.save();

    await creerNotification(user, appointment, user, agenda, 1);

    return appointment;
}



/**
 * Modification d’un rendez-vous
 */
export async function updateAppointment(user, body) {
    //mettre ici comme quoi on recupère only ou all pour savoir ce qu'on a choisi
    let {
        id,
        idRegle,
        nom,
        date_debut,
        date_fin,
        heure_debut,
        heure_fin,
        agendas,
        recurrence,
        frequenceId,
        fin_rec,
        date_fin_rec,
        modifRec,
        day,
        month,
        year,
    } = body;
 
    const jour = parseInt(day) +1; 
    const dateException = new Date(year, month, jour);

    const appointment = await AppointmentModel.findById(id).populate("agenda");
    if (!appointment) throw new Error("Rendez-vous introuvable");

    // Utiliser le nouvel agenda s'il est fourni, sinon conserver l'ancien.
    const agendaIdToUpdate = agendas || appointment.agenda._id;

    const newAgenda = await AgendaModel.findById(agendaIdToUpdate);
    if (!newAgenda) throw new Error("Agenda introuvable");

    // Vérification permission changement agenda
    if (!peutModifierRDV(agendaIdToUpdate, user._id)) {
        throw new Error("updateAppointment : Changement d’agenda non autorisé");
    }

    let dateDebut = buildDate(date_debut, heure_debut);
    let dateFin = buildDate(date_fin, heure_fin);

    let updatedRecRule = null;
    let appointmentNew = null;
    let updated = null;

    if (recurrence === "on") {
        // Si on modifie que un seul rdv
        if(modifRec === "only"){
            dateDebut = buildDate(new Date(year,month,day), heure_debut);
            dateFin = buildDate(new Date(year,month,day), heure_fin);
            appointmentNew = new AppointmentModel({
                agenda: newAgenda._id,
                nom,
                date_Debut: dateDebut,
                date_Fin: dateFin,
                recurrenceRule: null,
                modifRecurrence: true,
                createur: user._id,
            });
            await appointmentNew.save();
        }else{
            if (!date_fin_rec) {
                let rule = await RegleOccurrenceModel.findById(idRegle);
                if (rule) {
                    date_fin_rec = rule.date_fin;
                }
            }
            let dateFinRec = fin_rec === "never" ? null : new TZDate(date_fin_rec);
            // Si une règle existe -> update
            if (appointment.recurrenceRule) {
                updatedRecRule = await RegleOccurrenceModel.findByIdAndUpdate(
                    idRegle,
                    {
                        frequence: frequenceId,
                        date_fin: dateFinRec,
                    },
                    { new: true }
                );
            } else {
                // Sinon créer une nouvelle règle
                updatedRecRule = new RegleOccurrenceModel({
                    frequence: frequenceId,
                    date_fin: dateFinRec,
                });
                await updatedRecRule.save();
            }
        }
    } else {
        // Suppression règle
        updatedRecRule = null;
        /* appointmentNew = new AppointmentModel({
                agenda: newAgenda._id,
                nom,
                date_Debut: dateDebut,
                date_Fin: dateFin,
                recurrenceRule: null,
                createur: user._id,
            });
            await appointmentNew.save(); */
    }

    if(modifRec === "only" && recurrence === "on"){
        //Si on modifie que 1 seul rdv et qu'il y a encore la récurrence d'activer, il fait encore parti de la rec et donc on l'ajoute comme lié à la rec encore
        updated = await AppointmentModel.findByIdAndUpdate(
            id,
            {
                $addToSet: { 
                    exception: appointmentNew._id,
                    exceptionDate: appointmentNew.date_Debut 
                },
            },
            { new: true }
        );
    }else if (modifRec != "only"){ //passe pour all et off ou on
        // si il est sur all, on supprime le lien avec la récurrence si c'est undefined et on garde le lien si c'est on
        // Mise à jour RDV
        updated = await AppointmentModel.findByIdAndUpdate(
            id,
            {
                agenda: newAgenda._id,
                nom: nom,
                date_Debut: dateDebut,
                date_Fin: dateFin,
                recurrenceRule: updatedRecRule?._id || null,
            },
            { new: true }
        );
    }else if(modifRec === "only"){ //isoler un rdv de la récurrence pour l'enlever de la récurrence
        appointmentNew = new AppointmentModel({
                agenda: newAgenda._id,
                nom,
                date_Debut: dateDebut,
                date_Fin: dateFin,
                recurrenceRule: null,
                createur: user._id,
            });
        await appointmentNew.save();

        updated = await AppointmentModel.findByIdAndUpdate(
            id,
            {
                $addToSet: { 
                    exceptionDate: appointmentNew.date_Debut 
                },
            },
            { new: true }
        );
    }
    await creerNotification(user, updated, user, newAgenda, 2);

    return updated;
}



/**
 * Suppression d’un rendez-vous
 */
export async function deleteAppointment(user, body) {
    const { id, agendas, modifRec } = body;

    //il me faut le champs only ou all qui permet de savoir si je modifie que une unique occurrence ou si je modifie tout
    //si on supprime que une seule occurence, il faut que je récupère la date et que je 

    const appointment = await AppointmentModel.findById(id);
    if (!appointment) throw new Error("Rendez-vous introuvable");

    const agenda = await AgendaModel.findById(appointment.agenda).populate("user");
    if (!agenda) throw new Error("L'agenda associé à ce rendez-vous est introuvable.");

    const hasPermissionSupprimerRDV = await peutSupprimerRDV(agenda._id, user._id);

    if (!hasPermissionSupprimerRDV) {
        throw new Error("deleteAppointment : Vous n'avez pas les droits pour supprimer ce rendez-vous.");
    }

    if(appointment.recurrenceRule){
        const recId = appointment.recurrenceRule;
        if(modifRec === 'all'){
            if(appointment.exception && appointment.exception.length >0){
                const exceptionIds = appointment.exception.map(exc => exc._id);
                await AppointmentModel.deleteMany({ _id: { $in: exceptionIds } });
            }
            await RegleOccurrenceModel.findByIdAndDelete(recId);
            await AppointmentModel.findByIdAndDelete(id);
        }else if (modifRec === 'only'){
            const dateException = new Date(new Date(body.year, body.month, body.day).setHours(appointment.date_Debut.getHours()));
            await AppointmentModel.findByIdAndUpdate(
            id,
            {
                $addToSet: { exceptionDate: dateException },
            },
            { new: true }
        );
        }     
    }else{
        await AppointmentModel.findByIdAndDelete(id);
    }

    await creerNotification(agenda.user, appointment, user, agenda, 3);

    await supprimerNotification(id);

    return true;
}

/**
 * Construit les données nécessaires pour le formulaire de rendez-vous. (ajout ou modification)
 * @param {Object} options 
 * @returns 
 */
export function buildAppointmentFormData({ 
    user, appointment = null, day = null, month = null, year = null, selectedAgenda = null, beginningHour = 8
}) {
    const today = new TZDate();
    day = day ?? today.getDate();
    month = month ?? today.getMonth();
    year = year ?? today.getFullYear();

    const name = appointment?.nom || '';
    const rdvId = appointment?._id?.toString() || null;
    const recurrence = appointment?.recurrenceRule;
    const modifRecurrence = appointment?.modifRecurrence;
    let frequenceRegle = '';
    let regleId = null;
    let date_fin_ap = null;

    let requestedDate = parseDate(day, month, year);
    let requestedDateEnd = new TZDate(requestedDate);
    
    let dateDeb = new TZDate(requestedDate);
    dateDeb.setHours(beginningHour);
    
    let dateFin = new TZDate(requestedDate).setHours(beginningHour + 1);
    if(appointment) {
        if (!recurrence)
        {
            dateDeb = new TZDate(appointment.date_Debut);
            requestedDate = formatDate(dateDeb);
            dateFin = new TZDate(appointment.date_Fin);
            requestedDateEnd = formatDate(dateFin);
        }
    }

    let formDate = formatDate(dateDeb);
    let formDateFin = formatDate(requestedDateEnd);

    const formattedBeginningHour = formatDate(dateDeb, "HH:mm");
    const formattedEndHour = formatDate(dateFin, "HH:mm");

    if(recurrence && appointment.recurrenceRule) {
        frequenceRegle = appointment.recurrenceRule.frequence || '';
        regleId = appointment.recurrenceRule._id?.toString() || null;
        if(appointment.recurrenceRule.date_fin) {
            const d = new TZDate(appointment.recurrenceRule.date_fin);
            date_fin_ap = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        }
    }

    return { 
        day,
        month,
        year,
        name,
        rdvId,
        recurrence,
        modifRecurrence,
        frequenceRegle,
        regleId,
        date_fin_ap,
        formDate,
        formDateFin,
        formattedBeginningHour,
        formattedEndHour,
        selectedAgenda,
        formattedDate: formDate,
        user 
    };
}
