import express from "express";
import multer from "multer";
import { 
    creerAgenda, 
    getAgendasForUser, 
    deleteAgenda, 
    editAgenda, 
    creerIcal 
} from "../../database/agenda.js";
import { creerRegleOccurrence } from "../../database/regle_occurrence.js";
import { createAppointment } from "../../database/appointment.js";
import ical from 'node-ical';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Récupère tous les agendas de l'utilisateur
 * GET /api/agendas
 */
router.get("/", async (req, res, next) => {
    try {
        if (!res.locals.user) {
            return res.status(401).json({ success: false, error: "Non authentifié" });
        }

        const agendas = await getAgendasForUser(res.locals.user);

        res.json({
            success: true,
            agendas,
            userId: res.locals.user._id
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/**
 * Crée un nouvel agenda
 * POST /api/agendas
 */
router.post("/", async (req, res, next) => {
    try {
        if (!res.locals.user) {
            return res.status(401).json({ success: false, error: "Non authentifié" });
        }

        const { nom, description, couleur } = req.body;

        if (!nom || !couleur) {
            return res.status(400).json({ 
                success: false, 
                error: "Le nom et la couleur sont requis" 
            });
        }

        const agenda = await creerAgenda(res.locals.user, nom, description || "", couleur);

        res.json({
            success: true,
            message: "Agenda créé avec succès",
            agenda
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/**
 * Modifie un agenda
 * PUT /api/agendas/:id
 */
router.put("/:id", async (req, res, next) => {
    try {
        if (!res.locals.user) {
            return res.status(401).json({ success: false, error: "Non authentifié" });
        }

        const { nom, description, couleur } = req.body;

        if (!nom || !couleur) {
            return res.status(400).json({ 
                success: false, 
                error: "Le nom et la couleur sont requis" 
            });
        }

        await editAgenda(req.params.id, nom, description || "", couleur);

        res.json({
            success: true,
            message: "Agenda modifié avec succès"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/**
 * Supprime un agenda
 * DELETE /api/agendas/:id
 */
router.delete("/:id", async (req, res, next) => {
    try {
        if (!res.locals.user) {
            return res.status(401).json({ success: false, error: "Non authentifié" });
        }

        await deleteAgenda(res.locals.user, req.params.id);

        res.json({
            success: true,
            message: "Agenda supprimé avec succès"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/**
 * Exporte un agenda au format .ics
 * POST /api/agendas/:id/export
 */
router.post("/:id/export", async (req, res, next) => {
    try {
        if (!res.locals.user) {
            return res.status(401).json({ success: false, error: "Non authentifié" });
        }

        const icalData = await creerIcal(req.params.id);
        
        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', 'attachment; filename="agenda.ics"');
        res.send(icalData);
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/**
 * Importe un agenda depuis un fichier ics
 * POST /api/agendas/import
 */
router.post("/import", upload.single('file'), async (req, res, next) => {
    try {
        if (!res.locals.user) {
            return res.status(401).json({ success: false, error: "Non authentifié" });
        }

        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: "Aucun fichier fourni" 
            });
        }

        const { nom, description, couleur } = req.body;

        if (!nom) {
            return res.status(400).json({ 
                success: false, 
                error: "Le nom de l'agenda est requis" 
            });
        }

        const agenda = await creerAgenda(
            res.locals.user,
            nom,
            description || '',
            couleur || 'blue'
        );
    
        const data = ical.sync.parseICS(req.file.buffer.toString('utf-8'));
        const frequences = { 3: "day1", 2: "week1", 1: "month1" };

        let importedCount = 0;
    
        for (const i in data) {
            const event = data[i];
            
            if (event.type === 'VEVENT' && !event.recurrenceid) {
                
                let regle = null;
                if (event.rrule) {
                    const frequence = frequences[event.rrule.options.freq];
                    if (frequence){
                        const regleOccurence = await creerRegleOccurrence(
                            frequence,
                            event.rrule.options.until,
                            event.rrule.options.interval
                        );
                        regle = regleOccurence._id;
                    }
                }
    
                const exceptionIds = [];
                
                if (event.recurrences) {
                    for (const key in event.recurrences) {
                        const recEvent = event.recurrences[key];
                        
                        const newException = await createAppointment(
                            agenda._id,
                            recEvent.summary || event.summary,
                            recEvent.start,
                            recEvent.end,
                            res.locals.user._id,
                            null,
                            [],
                            [],           
                            true
                        );
                        
                        exceptionIds.push(newException._id);
                    }
                }
    
                let exceptionDates = [];
                if (event.exdate) {
                    exceptionDates = Object.values(event.exdate);
                }
    
                await createAppointment(
                    agenda._id,
                    event.summary || "Sans titre",
                    event.start,
                    event.end,
                    res.locals.user._id,
                    regle,
                    exceptionIds,
                    exceptionDates,
                    false
                );

                importedCount++;
            }
        }

        res.json({
            success: true,
            message: `Agenda importé avec succès (${importedCount} rendez-vous)`,
            agenda
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

export default router;