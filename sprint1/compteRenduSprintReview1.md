# Compte rendu du Sprint review 1

## Etat 

### Rendez-vous
| Item                  |  | Niveau de priorité |  | Equipe | Status |
|------------------------|--|-----------------|--|-|-|
| Modification RDV     | | 2 | | Équipe 1 | Validé |
| Suppresion RDV   | | 2 | | Équipe 1 | Validé |

### Agendas
| Item                               |  | Niveau de priorité | | Equipe | Status |
|------------------------------------|---|----|--------------|--|-|
| Création d'un agenda                |  | 1 | | Équipe 2 | Validé |
| Système de notification | | 2 | | Équipe 1 | Validé |

### Frontend
| Item                               |  | Niveau de priorité | | Equipe | Status |
|------------------------------------|---|----|--------------|--|-|
| Visualisation à la semaine                |  | 1 | | Équipe 3 | Validé
| Visualisation d'un rendez-vous d'affilé (sans coupure entre les heures)                |  | 1 | | Équipe 3 | Validé
| Voir si des rendez-vous existent sur l'agenda mensuel et hebdomadaire                |  | 1 | | Équipe 3 | Validé
| Visualisation des agendas simultanées|  | 1 | | Équipe 2 | Validé
| Visualisation d'un système de notification | | 2 | | Équipe 3 | Validé


## Review

- Tout ce qu'on devait faire a été fait
- Meilleur utilisation du temps 

## Axe d'amélioration

### Backend:
- Unifier les routes
- Hasher le mot de passe 
- Supprimer les notifications liés aux agendas/rendez-vous supprimés
- Avoir une route /api/ pour la modification/suppression ? (ça fait pro)
- Vérifier que l'utilisateur peut modifier les agendas/rendez-vous

### Frontend:
- Plusieurs thèmes (car je trouve ça bien)
- Faire du tailwind local, éviter le CDN pour appliquer des styles css plus rapidement/facilement
- Les chevrons doivent modifier le mois/jour/semaine en fonction de ce qui est affiché
- Les notifications sont un menu déroulant
- Responsive
- Des petites animations aux filtres du calendrier
- Checkboxes plus jolies pour le filtre
- localStorage pour les filtres

### Back/front:
- Quand le calendrier est modifié, ne pas recharger la page mais seulement le calendrier
- La modification des rendez-vous doivent se faire sur la page du calendrier (un pop-up quoi)

### Général: 
- Ajouter des commentaires dans le code
