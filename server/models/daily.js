
/**
 *  Génère les données des 24 heures d'une journée.
 * 
 * @param {Number} year L'année (4 chiffres)
 * @param {Number} month Le mois (2 chiffres de 0 à 11)
 * @param {Number} day Le jour (2 chiffres de 0 à 30) 
 * @return {Array} Un tableau contenant les heures de la journée
 */
export function getDailyData(year, month, day)
{
    const hours = [];

    
    for(let h = 0; h < 24; h++)
    {
        hours.push(h);
    }

    return hours;
}