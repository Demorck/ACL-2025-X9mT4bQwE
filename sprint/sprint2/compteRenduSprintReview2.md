# Compte rendu du Sprint review 1

## Etat 

### Rendez-vous
| Item                  |  | Niveau de priorité  | Équipe | Status |
|------------------------|--|-----------------|---|-|
| rendez vous récurrents | | 1 | Équipe 1, Équipe 3 | Validé (la base est faite, pas les exceptions)
| rechercher un rdv | | 3 | Équipe 1 | Validé
| Améliorer l'ajout d'un rdv | | 2 | Équipe 2 | Validé
| Ajouter confirmation de suppression | | 3 | Équipe 1 | Validé

### Entre utilisateurs
| Item                  |  | Niveau de priorité  | Équipe | Status
|------------------------|--|-----------------|---|-|
| Partage d'un agenda | | 1 | Équipe 2 | Validé
| Révoquer le partage d'un agenda | | 2 | Équipe 2 | Validé
| Ajout de notification lors d'une invitation à un agenda | | 2 | Équipe 2 | Validé

### Utilisateur
| Item                  |  | Niveau de priorité  | Équipe | Status 
|------------------------|--|-----------------|---|-|
| Ajouter profil utilisateur | | 1 | Équipe 3 | Validé
| Modification profil utilisateur | | 3 | Équipe 3 | Validé

### Notifications
| Item                  |  | Niveau de priorité  | Équipe | Status
|------------------------|--|-----------------|---|-|
| Suppression des notifications liés aux rendez-vous/agendas quand ceux-ci sont supprimés | | 1 | Équipe 1 | Validé
| Les notifications sont un menu déroulant quand on clique | | 4 | Équipe 1 | Non validé

### Affichage
| Item                  |  | Niveau de priorité  | Équipe | Status
|------------------------|--|-----------------|---|-|
| Choix d'un thème utilisateur | | 5 | Équipe 3 | Validé
| Responsive | | 3 | Équipe 3 | Validé
| Divers affichages du calendrier (+ bug chevauchement) | | 1 | Équipe 3 | Validé
| Changer bouton retour | | 3 | Équipe 3 | Validé

### Backend
| Item                  |  | Niveau de priorité  | Équipe | Status
|------------------------|--|-----------------|---|-|
| Unifier les routes + route /api/ + dossier | | 1 | Toutes les équipes | En cours
| Hasher le mot de passe | | 1 | Équipe 2 | Validé

## Review

- Trop de charge de travail 
- Obligation d'attendre certains travaux pour continuer (notamment unifier les routes)

## Axe d'amélioration

- Rajout dans le backlog les dépendances entre les tâches
- Ne pas recharger la page mais seulement le contenu (ça se voit sur notifications, si on en lit une en bas de la page)
- Améliorer les rendez-vous récurents
- Modifier un rendez-vous en drag & drop (et faire un toast pour le rendu)
- Pouvoir choisir une date directement sur le calendrier (le header du calendrier)