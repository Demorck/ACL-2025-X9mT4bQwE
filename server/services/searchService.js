import { AppointmentModel } from "../database/appointment.js";

/**
 * Fonction qui retourne les rendez-vous correspondant à l'entrée utilisateur
 * @param {String} str : entrée saisie par l'utilisateur dans la barre de recherche
 * @param {Int} agendaIds : Id des agendas dans laquel la recherche est faite
 * @param {Date} filtreDateMin : Date min donné par l'utilisateur le filtre 
 * @param {Date} filtreDateMax : Date max donné par l'utilisateur le filtre
 * @param {List(Int)} filtreAgendasUtilise : Agenda coché par l'utilisateur le filtre 
 * @param {Int} limit
 * @param {Int} page  
 * @param {*} next 
 * @returns 
 */
export async function rechercheRendezVous(str, agendaIds, filtreDateMin, filtreDateMax, filtreAgendasUtilise, page, limit, next) {
  try {
    if (!str || str.trim() === "")
      return [];

    // permet d'avoir les agendas selectionné (si aucun, cela prend tout les agendas de l'utilisateur)
    const agendasPourRecherche = (filtreAgendasUtilise && filtreAgendasUtilise.length > 0) ? 
                                 filtreAgendasUtilise : 
                                 agendaIds;

    // les recherches de base sont faite sur un an avant et apres aujourd'hui
    const dateMax = new Date();
    dateMax.setFullYear(dateMax.getFullYear() + 1);
    const dateMin = new Date();
    dateMin.setFullYear(dateMin.getFullYear() - 1);

    const minDateObj = filtreDateMin ? new Date(filtreDateMin) : dateMin;
    let maxDateObj = filtreDateMax ? new Date(filtreDateMax) : dateMax;    
    if (maxDateObj) {
        maxDateObj.setHours(23, 59, 59, 999);
    }

    // recherche dans la bdd
    const appointments = await AppointmentModel.find({
        agenda: { $in: agendasPourRecherche },
        nom: { $regex: new RegExp(`^${str}`, 'i') } 
    }).populate('recurrenceRule');
    const resultatsFinaux = [];

    // Boucle pour ajouter les rdv et appliquer les filtres
    for (let rdv of appointments) {
      let rdvOriginal = rdv.toObject();
      const debutRdv = new Date(rdvOriginal.date_Debut);
      const dureeMs = new Date(rdvOriginal.date_Fin).getTime() - debutRdv.getTime();
          
      // Si rdv pas récurrent
      if (!rdv.recurrenceRule) {
          if ((!minDateObj || debutRdv >= minDateObj) && 
              (!maxDateObj || debutRdv <= maxDateObj)) {
              resultatsFinaux.push(rdvOriginal);
          }
          continue;
      }
    
      const regle = rdv.recurrenceRule;            
      let dateDebutReccurence = new Date(debutRdv);            
      let dateFinRecurrence = regle.date_fin ? new Date(regle.date_fin) : dateMax;
      let dateDebutCalcul = (minDateObj && debutRdv < minDateObj) ? minDateObj : debutRdv;
      if (maxDateObj && maxDateObj < dateFinRecurrence) {
          dateFinRecurrence = maxDateObj;
      }
      if (dateDebutCalcul > dateFinRecurrence) 
        continue;
            

      let intervalle = parseInt(regle.intervale);
      if (isNaN(intervalle) || intervalle < 1) 
        intervalle = 1;
      if (minDateObj && dateDebutReccurence < minDateObj) {
          // On traite la premiere occurence ici
           while (dateDebutReccurence < minDateObj && dateDebutReccurence <= dateFinRecurrence) {
              dateDebutReccurence = avanceDate(dateDebutReccurence, regle.frequence, intervalle);
           }
           // Passe au prochain rdv
           if (!dateDebutReccurence || dateDebutReccurence > dateFinRecurrence || dateDebutReccurence > dateFinRecurrence) {
               continue;
           }
      }
      // Ajoute les rdv réccurents
      while (dateDebutReccurence <= dateFinRecurrence) {
        if (!minDateObj || dateDebutReccurence >= minDateObj) {
            resultatsFinaux.push({
                ...rdvOriginal,
                recurrenceRule: undefined,
                date_Debut: new Date(dateDebutReccurence),
                date_Fin: new Date(dateDebutReccurence.getTime() + dureeMs)
            });
        }
        
        dateDebutReccurence = avanceDate(dateDebutReccurence, regle.frequence, intervalle);
        if (!dateDebutReccurence) 
          break;
      }
        }
        resultatsFinaux.sort((a, b) => a.date_Debut.getTime() - b.date_Debut.getTime());
        
        // Traitement de l'infinity scroll 
        const debutIndex = (page - 1) * limit;
        const finIndex = page * limit;
        const paginatedResults = resultatsFinaux.slice(debutIndex, finIndex);

        return {
            results: paginatedResults,
            hasMore: finIndex < resultatsFinaux.length
        };

    } catch (error) {
        next(error);
    }
}