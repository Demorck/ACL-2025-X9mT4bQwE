// services/appointmentService.js
import { AppointmentModel } from "../database/appointment.js";
import { RegleOccurrenceModel } from "../database/regle_occurrence.js";
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

    await creerNotification(user, appointment, undefined, agenda, 1);

    return appointment;
}



/**
 * Modification d’un rendez-vous
 */
export async function updateAppointment(user, body) {
    const {
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
    } = body;

    const appointment = await AppointmentModel.findById(id).populate("agenda");
    if (!appointment) throw new Error("Rendez-vous introuvable");

    const newAgenda = await AgendaModel.findById(agendas);
    if (!newAgenda) throw new Error("Agenda introuvable");

    // Vérification permission changement agenda
    if (
        appointment.agenda.user.toString() !== user._id.toString() &&
        newAgenda._id.toString() !== appointment.agenda._id.toString()
    ) {
        throw new Error("Changement d’agenda non autorisé");
    }

    const dateDebut = buildDate(date_debut, heure_debut);
    const dateFin = buildDate(date_fin, heure_fin);

    let updatedRecRule = null;

    if (recurrence === "on") {
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
    } else {
        // Suppression règle
        updatedRecRule = null;
    }

    // Mise à jour RDV
    const updated = await AppointmentModel.findByIdAndUpdate(
        id,
        {
            agenda: newAgenda._id,
            nom,
            date_Debut: dateDebut,
            date_Fin: dateFin,
            recurrenceRule: updatedRecRule?._id || null,
        },
        { new: true }
    );

    await creerNotification(user, updated, user, newAgenda, 2);

    return updated;
}



/**
 * Suppression d’un rendez-vous
 */
export async function deleteAppointment(user, body) {
    const { id, agendaId } = body;

    const appointment = await AppointmentModel.findById(id);
    if (!appointment) throw new Error("Rendez-vous introuvable");

    const agenda = await AgendaModel.findById(agendaId).populate("user");

    const ownerId = agenda.user._id.toString();
    const creatorId = appointment.createur.toString();

    if (
        user._id.toString() !== ownerId &&
        user._id.toString() !== creatorId
    ) {
        throw new Error("Ce rendez-vous ne vous appartient pas");
    }

    await creerNotification(agenda.user, appointment, user, agenda, 3);

    await supprimerNotification(id);

    await AppointmentModel.findByIdAndDelete(id);

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
    const recurrence = !!appointment?.recurrenceRule;
    let frequenceRegle = '';
    let regleId = null;
    let date_fin_ap = null;

    let requestedDate = parseDate(day, month, year);
    let requestedDateEnd = new TZDate(requestedDate);
    
    let dateDeb = new TZDate(requestedDate).setHours(beginningHour);
    let dateFin = new TZDate(requestedDate).setHours(beginningHour + 1);
    if(appointment) {
        dateDeb = new TZDate(appointment.date_Debut);
        requestedDate = formatDate(dateDeb);
        dateFin = new TZDate(appointment.date_Fin);
        requestedDateEnd = formatDate(dateFin);
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
