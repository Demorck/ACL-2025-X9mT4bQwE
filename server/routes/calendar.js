import { AppointmentModel } from "../database/appointment.js";

export async function routeCalendar(req, res) {
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
  }).sort({ date_Debut: 1 });

  // Déterminer les jours avec au moins un rendez-vous (un set car on s'en fout le nombre de rendez-vous, tant qu'il y en a au moins un)
  const daysWithAppointments = new Set();
  appointments.forEach(app => {
    const start = new Date(app.date_Debut);
    const end = new Date(app.date_Fin);

    // On borne les dates pour rester dans le mois affiché (plus tard si on fait l'affichage comme au jour)
    const visibleStart = start < startOfMonth ? startOfMonth : start;
    const visibleEnd = end > endOfMonth ? endOfMonth : end;

    for (let d = new Date(visibleStart); d <= visibleEnd; d.setDate(d.getDate() + 1)) {
      if (d.getMonth() === month) {
        daysWithAppointments.add(d.getDate());
      }
    }
  });

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
    days,
    daysWithAppointments: Array.from(daysWithAppointments),
  });
}
