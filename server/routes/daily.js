import { AppointmentModel } from "../database/appointment.js";

export async function routeDaily(req, res, next) {
  const { day, month, year } = req.query;

  if (!day || !month || !year) {
    return next(new Error("Paramètres manquants pour la vue quotidienne"));
  }

  const startOfDay = new Date(year, month, day, 0, 0, 0);
  const endOfDay = new Date(year, month, day, 23, 59, 59);

  const appointments = await AppointmentModel.find({
    $or: [
      {
        date_Debut: { $lt: endOfDay },
        date_Fin: { $gte: startOfDay },
      },
    ],
  })
    .populate("agenda")
    .sort({ date_Debut: 1 });

  /**
   * Transforme les rendez-vous pour l'affichage dans la vue quotidienne.
   * Chaque rendez-vous est transformé pour inclure :
    * - nom : le nom du rendez-vous
    * - start : l'objet Date de début
    * - end : l'objet Date de fin
    * - startHour : l'heure de début en format décimal (ex: 14.5 pour 14h30)
    * - durationHours : la durée du rendez-vous en heures (ex: 1.5 pour 1h30)
    * - startLabel : l'heure de début formatée en chaîne lisible (ex: "14:30")
    * - endLabel : l'heure de fin formatée en chaîne lisible (ex: "16:00")
   */
  const processed = appointments.map(app => {
    let start = new Date(app.date_Debut);
    let end = new Date(app.date_Fin);

    // Tronque les rendez-vous aux limites de la journée affichée
    start = start < startOfDay ? startOfDay : start;
    end = end > endOfDay ? endOfDay : end;

    const durationHours = (end - start) / (1000 * 60 * 60);
    const startHour = start.getHours() + start.getMinutes() / 60;

    return {
      nom: app.nom,
      start,
      end,
      startHour,
      durationHours,
      color: app.agenda.couleur,
      startLabel: start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      endLabel: end.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };
  });

  /**
   * Disposition des rendez-vous en colonnes pour éviter les chevauchements visuels.
   * Pour chaque rendez-vous, on tente de le placer dans la première colonne. Si un chevauchement est détecté,
   * on essaie la colonne suivante, et ainsi de suite. Si aucune colonne n'est disponible, on crée une nouvelle colonne.
   */
  const columns = []; 
  for (const app of processed) {
    let placed = false;
    for (const col of columns) {
      // Vérifie s'il y a un chevauchement
      if (col[col.length - 1].end <= app.start) {
        col.push(app);
        placed = true;
        break;
      }
    }
    if (!placed) columns.push([app]);
  }

  // Ajoute les informations des colonnes aux rendez-vous pour le CSS
  const totalCols = columns.length;
  columns.forEach((col, i) => {
    col.forEach(app => {
      app.colIndex = i;
      app.colCount = totalCols;
    });
  });

  const flatAppointments = columns.flat();

  res.render("calendar/daily", {
    year,
    month,
    day,
    appointments: flatAppointments,
  });
}
