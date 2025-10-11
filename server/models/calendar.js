
/**
 * Génère les données d'un mois pour un calendrier pour savoir les jours. 
 *
 * @param {Number} year L'année (4 chiffres) 
 * @param {Number} month Le mois (0-11) 
 * @returns {Array} Un tableau contenant les jours du mois, avec des valeurs null pour les jours vides. Ca commence à un lundi.
 */
export function getMonthData(year, month) {
  const date = new Date(year, month, 1);
  const days = [];
  const firstDay = date.getDay(); // de 0 à 6, dimanche à samedi.
  const lastDate = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < (firstDay == 0 ? 6 : firstDay - 1); i++) {
    days.push(null);
  }

  for (let d = 1; d <= lastDate; d++) {
    days.push(d);
  }
  
  return days;
}
