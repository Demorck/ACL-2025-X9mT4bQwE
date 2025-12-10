import { formatHourMinute, toLocalDate, getDayRange } from "./date.js";

/**
 * Transforme et découpe les rendez-vous sur une plage donnée (jour, semaine, etc.).
 * Gère aussi les rendez vous qui s'étalent sur plusieurs jours.
 *
 * @param {Array} appointments Liste des rendez-vous Mongo
 * @param {Date} rangeStart Début de la période
 * @param {Date} rangeEnd Fin de la période
 * @returns {Array} Liste aplatie des rendez-vous
 */
export function normalizeAppointment(appointments, rangeStart, rangeEnd) {
  let results = [];

  for (let app of appointments) {
    let start = toLocalDate(app.date_Debut);
    let end = toLocalDate(app.date_Fin);

    if (end < rangeStart || start > rangeEnd) continue;

    start = start < rangeStart ? rangeStart : start;
    end = end > rangeEnd ? rangeEnd : end;

    let current = new Date(start);
    while (current < end) {
      let { start: dayStart, end: dayEnd } = getDayRange(current);

      let segmentStart = start > dayStart ? start : dayStart;
      let segmentEnd = end < dayEnd ? end : dayEnd;

      if (segmentEnd <= segmentStart) break;

      let durationHours = (segmentEnd - segmentStart) / (1000 * 60 * 60);
      let startHour = segmentStart.getHours() + segmentStart.getMinutes() / 60;

      results.push({
        nom: app.nom,
        id: app.id ?? app._id.toString(),
        start: segmentStart,
        end: segmentEnd,
        startHour,
        durationHours,
        color: app.agenda.couleur,
        agendaName : app.agenda.nom,
        agendaId : app.agenda.id ?? app.agenda._id.toString(),
        startLabel: formatHourMinute(segmentStart),
        endLabel: formatHourMinute(segmentEnd),
        recurrenceRule: app.recurrenceRule || null
      });

      current = new Date(dayEnd.getTime() + 1);
      // current.setHours(0, 0, 0, 0);
    }
  }

  return results;
}

/**
 * Organise les rendez-vous en colonnes pour éviter les chevauchements visuels.
 * Chaque rendez-vous est placé dans la première colonne disponible sans conflit.
 * Retourne une liste aplatie avec les propriétés `colIndex` et `colCount`.
 */
export function arrangeAppointmentsInColumns(appointments) {
    let sorted = [...appointments].sort((a, b) => a.start - b.start);
    let columns = [];

    for (let app of sorted) {
    let placed = false;

    for (let col of columns) {
        if (col[col.length - 1].end <= app.start) {
            col.push(app);
            placed = true;
            break;
        }
    }

    if (!placed) columns.push([app]);
    }

    let totalCols = columns.length;
        columns.forEach((col, i) => {
            col.forEach(app => {
                app.colIndex = i;
                app.colCount = totalCols;
            });
    });

    return columns.flat();
}
