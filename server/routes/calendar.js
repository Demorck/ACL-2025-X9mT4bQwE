import { AppointmentModel } from "../database/appointment.js";

export async function routeCalendar(req, res) {
  if (!res.locals.user) {
    return res.redirect("/login");
  }

  const queryMonth = parseInt(req.query.month);
  const queryYear = parseInt(req.query.year);

  const today = new Date();
  const year = !isNaN(queryYear) ? queryYear : today.getFullYear();
  const month = !isNaN(queryMonth) ? queryMonth : today.getMonth();

  const startOfMonth = new Date(year, month, 1, 0, 0, 0);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

  // Récupération des rendez-vous du mois
  const appointments = await AppointmentModel.find({
    date_Debut: { $lt: endOfMonth },
    date_Fin: { $gte: startOfMonth },
  })
    .populate("agenda")
    .sort({ date_Debut: 1 });

  // Déterminer les jours avec au moins un rendez-vous (un set car on s'en fout le nombre de rendez-vous, tant qu'il y en a au moins un)
  const appointmentsByDay = {};
  for (const app of appointments) {
    const start = new Date(app.date_Debut);
    const end = new Date(app.date_Fin);

    // On parcourt tous les jours que couvre le rendez-vous
    for (
      let d = new Date(start);
      d <= end;
      d.setDate(d.getDate() + 1)
    ) {
      const key = d.toISOString().slice(0, 10); // ex : "2025-10-18"
      if (!appointmentsByDay[key]) appointmentsByDay[key] = new Set();
      appointmentsByDay[key].add(app.agenda.couleur);
    }
  }

  // Construire les jours du mois (besoin que du jour dans la vue mais sait-on jamais)
  const days = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, month, year });
  }

  const monthNames = [
    "Janvier","Février","Mars","Avril","Mai","Juin",
    "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
  ];

  res.render("calendar/calendar", {
    year,
    month,
    monthName: monthNames[month],
    appointmentsByDay
  });
}
