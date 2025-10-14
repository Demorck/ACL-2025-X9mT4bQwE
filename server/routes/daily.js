import { getDailyData } from "../models/daily.js";

export async function routeDaily(req, res) {
    const queryDay = parseInt(req.query.day);
    const queryMonth = parseInt(req.query.month);
    const queryYear = parseInt(req.query.year);
    
    if(isNaN(queryDay) || isNaN(queryMonth) || isNaN(queryYear))
    {
        res.status(400).send("Il manque des paramètres pour afficher la page journalière. Veuillez fournir le jour, le mois et l'année.");
        return;
    }
    
    const monthNames = [
        "Janvier","Février","Mars","Avril","Mai","Juin",
        "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
    ];
    
    res.render("daily", { 
        day: queryDay,
        month: queryMonth,
        year: queryYear,
        monthName: monthNames[queryMonth],
        hours: await getDailyData(queryYear, queryMonth, queryDay+1),
    });
}