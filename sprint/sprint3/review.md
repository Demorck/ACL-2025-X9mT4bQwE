# Backlog - sprint 3

Priorité: 1 maximum - 5 minimum

## Organisation

### Équipes 
Équipe 1 : MALCUIT, HOUSSEIN

Équipe 2 : GUITTIENNE, MARQUE

Équipé 3 : ANTOINE

## Fonctionnalitées

### Rendez-vous
| Item                  |  | Niveau de priorité  | Équipe | Status |
|------------------------|--|-----------------|---|-----|
| Rendez vous récurrents | | 1 | Toutes les équipes | Majoritairement fini/ décision de contraindre certains cas  | 
| Modification d'un rendez-vous en drag & drop | | 5 | Équipe 3 | Terminé, fonctionnel 100 |

### Affichage
| Item                  |  | Niveau de priorité  | Équipe | Status |
|------------------------|--|-----------------|---|--|
| Personnalisation d'un thème utilisateur | | 5 | Équipe 3 | Non commencé |
| Recharger les contenus dynamiquements | | 1 | Équipe 3 | Validé |
| Ajout d'un affichage pour voir si on est invité dans le filtre des agendas | | 3 | Équipe 3 | Fait, fonctionnel |
| Affichage par année, par décade, par siècle | | 2 | Équipe 3 | On peut afficher par année, mais pas par decade ni siècle 🤦‍♂️|
| Modifier les boutons suivants/précédents pour les mettre au milieu du header du calendrier | | 4 | Équipe 3 | Fait
| Ajout d'un toast pour les notifications | | 4 | Équipe 1 | Fait

### Agendas
| Item                  |  | Niveau de priorité  | Équipe | Status |
|------------------------|--|-----------------|---|--|
| Ajout de rôles pour les agendas partagés | | 2 | Équipe 2 | Fait
| Importation/exportation | | 2 | Équipe 2 | Fait |

## Améliorations
| Item                  |  | Niveau de priorité  | Équipe | Status |
|------------------------|--|-----------------|---|--|
| Amélioration barre de recherche | | 2 | Équipe 1 | Fait

### Backend
| Item                  |  | Niveau de priorité  | Équipe | Status |
|------------------------|--|-----------------|---|--  |
| Unifier les routes + route /api/ + dossier | | 1 | Toutes les équipes | Validé mais toujours améliorable


## Review
- **RDV Récurrents** :
  - Modification d'une occurrence bloquée au jour même (chgt heure uniquement).
  - Si décalage de toute la récurrence, réapparition des occurrences supprimées.
  - La création de rdv récurrents fonctionne, modifier/supprimer pareil, l'interface est simple d'usage.
  - Certaines exceptions n'ont pas été pris en charge.

- **Rôle** :
  - Aurait pu avoir plus de rôles, plus de possibilités de personnalisation des rôles.
  - Les rôles classiques de tout agenda sont implémantées.
  - La gestion des rôles par le propriétaire et/ou l'administrateur fonctionne bien

- **Barre de recherche**
  - Les filtres ne peuvent pas être appliqués en dehors du calendrier, càd rechercher les rdv depuis la page agendas par exemple.
  - La recherche *sans filtres* se contente de rechercher les rdv jusqu'à + ou - 1 an à compter de la date du jour.
  - Endless scroll (avec pagination de 20).

- **Toasts**
  - On les dévore sans retenu

- **Import/Export**
  - Fonctionne avec tout nos cas d'usages.


- **Front**
  - DragNDrop fonctionnel
  - Pages rendues dynamiques 
  - Chargement depuis le serveur des RDV en fonction de la vue (évite de saturer la RAM alors même que le prix fait x100 toutes les heures)
  

## Axes d'améliorations