import express from "express";
import { listAgendas } from "../../database/agenda.js";
import * as searchService from "../../services/searchService.js";

const router = express.Router();

/**
 * Route pour rechercher des rendez-vous
 * POST /api/search
 */
router.post("/", async (req, res, next) => {
    try {
        const user = res.locals.user;
        
        if (!user) {
            return res.status(401).json({ 
                error: "Utilisateur non authentifié" 
            });
        }

        const { str, filtreDateMin, filtreDateMax, filtreAgendasUtilise, page = 1, limit = 20 } = req.body;

        // Récupérer les IDs de tous les agendas de l'utilisateur
        const agendas = await listAgendas(user);
        const agendaIds = agendas.map(a => a._id);

        // Effectuer la recherche
        const reponse = await searchService.rechercheRendezVous(
            str,
            agendaIds,
            filtreDateMin,
            filtreDateMax,
            filtreAgendasUtilise,
            parseInt(page),
            parseInt(limit),
            next
        );

        res.json(reponse);
    } catch (error) {
        next(error);
    }
});

export default router;