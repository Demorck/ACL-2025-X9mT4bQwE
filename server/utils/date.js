import { TZDate } from "@date-fns/tz";
import { addDays, endOfWeek, endOfDay, isSameDay, startOfDay, startOfWeek, format } from "date-fns";
import { fr } from "date-fns/locale";

const TIMEZONE = "Europe/Paris";

/**************************************************************************
 * Fonctions utilitaires pour la gestion des dates
 ***************************************************************************/

/**
 * Parse une date à partir du jour, mois, année.
 * @param {number} day Le jour du mois (1-31)
 * @param {number} month Le mois (1-12)
 * @param {number} year L'année
 * @returns {Date}
 */
export function parseDate(day, month, year) {
    if (typeof day === "string") day = parseInt(day, 10);
    if (typeof month === "string") month = parseInt(month, 10);
    if (typeof year === "string") year = parseInt(year, 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
        throw new Error("Date invalide");
    }

    return new TZDate(year, month, day, TIMEZONE);
}

/**
 * Convertit une date en heure locale dans le fuseau français.
 * @param {Date} date 
 * @returns {TZDate}
 */
export function toLocalDate(date) {
    return new TZDate(date, TIMEZONE);
}

export function toLocalDateHours(date, hours, minutes = 0, seconds = 0, milliseconds = 0) {
    let local = new TZDate(date, TIMEZONE);
    local.setHours(hours, minutes, seconds, milliseconds);
    return local;
}

export function getCalendarDays(year, month) {
    // 1️⃣ Premier et dernier jour du mois
    const firstOfMonth = new TZDate(year, month, 1, TIMEZONE);
    const lastOfMonth = new TZDate(year, month + 1, 0, TIMEZONE);

    // 2️⃣ Trouver le lundi avant ou égal au premier jour du mois
    const start = new TZDate(firstOfMonth);
    const day = start.getDay(); // 0=dimanche, 1=lundi, ...
    const diffToMonday = (day + 6) % 7; // combien de jours avant lundi
    start.setDate(start.getDate() - diffToMonday);

    // 3️⃣ Trouver le dimanche après ou égal au dernier jour du mois
    const end = new TZDate(lastOfMonth);
    const endDay = end.getDay();
    const diffToSunday = (7 - endDay) % 7;
    end.setDate(end.getDate() + diffToSunday);

    // 4️⃣ Générer toutes les semaines
    const weeks = [];
    let current = new TZDate(start);

    const days = [];
    while (current <= end) {
        days.push(new TZDate(current));
        current.setDate(current.getDate() + 1);
    }
    return days;
}

/**
 * Formate une date selon un motif donné.
 * @param {Date} date La date à formater
 * @param {string} pattern Le motif de formatage (par défaut "yyyy-MM-dd"). Voir https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @returns {string}
 */
export function formatDate(date, pattern = "yyyy-MM-dd") {
    return format(date, pattern, {locale: fr });
}

/**
 * Formate une date au format "HH:mm".
 * @param {Date} date La date à formater
 * @returns {string} La date formatée au format "HH:mm"
 */
export function formatHourMinute(date) {
    return formatDate(date, "HH:mm");
}

/**
 * Vérifie si deux dates sont le même jour.
 * @param {Date} date1 La première date
 * @param {Date} date2 La deuxième date
 * @returns {boolean} true si les dates sont identiques, false sinon
 */
export function sameDay(date1, date2) {
    return isSameDay(date1, date2);
}

/**
 * Décale une date d'un certain nombre de jours.
 * @param {Date} date La date à décaler
 * @param {number} days Le nombre de jours à ajouter (peut être négatif)
 * @returns {Date} La nouvelle date décalée
 */
export function shiftDate(date, days) {
    return addDays(date, days);
}

/**************************************************************************
 * Fonctions utilitaires pour la gestion des jours
 ***************************************************************************/

/**
 * Obtient le début et la fin du jour pour une date donnée.
 * @param {Date} date La date pour laquelle obtenir la plage du jour
 * @returns {{ start: Date, end: Date }} La date de début (00:00:00) et de fin (23:59:59) du jour
 */
export function getDayRange(date) {
    let local = new TZDate(date, TIMEZONE);
    let start = startOfDay(local);
    let end = endOfDay(local);
    return { start, end };
}


/**************************************************************************
 * Fonctions utilitaires pour la gestion des semaines
 ***************************************************************************/

/**
 * Obtient le début et la fin de la semaine pour une date donnée.
 * @param {Date} date La date pour laquelle obtenir la plage de la semaine
 * @returns {{ start: Date, end: Date }} La date de début (lundi) et de fin (dimanche) de la semaine
 */
export function getWeekRange(date) {
    let local = new TZDate(date, TIMEZONE);
    let start = startOfWeek(local, { weekStartsOn: 1 });
    let end = endOfWeek(local, { weekStartsOn: 1 });
    return { start, end };
}

export function getFirstDayOfWeek(date) {
    let local = new TZDate(date, TIMEZONE);
    let start = startOfWeek(local, { weekStartsOn: 1 });
    return start;
}