# Backlog - sprint 2

Priorité: 1 maximum - 5 minimum

## Organisation


### Équipes 
Équipe 1 : MALCUIT, HOUSSEIN

Équipe 2 : GUITTIENNE, MARQUE

Équipé 3 : ANTOINE

## Fonctionnalitées

### Rendez-vous
| Item                  |  | Niveau de priorité  | Équipe |
|------------------------|--|-----------------|---|
| rendez vous récurrents | | 1 | Équipe 1, Équipe 3
| rechercher un rdv | | 3 | Équipe 1
| Améliorer l'ajout d'un rdv | | 2 | Équipe 2
| Ajouter confirmation de suppression | | 3 | Équipe 1

### Entre utilisateurs
| Item                  |  | Niveau de priorité  | Équipe |
|------------------------|--|-----------------|---|
| Partage d'un agenda | | 1 | Équipe 2
| Révoquer le partage d'un agenda | | 2 | Équipe 2
| Ajout de notification lors d'une invitation à un agenda | | 2 | Équipe 2

### Utilisateur
| Item                  |  | Niveau de priorité  | Équipe |
|------------------------|--|-----------------|---|
| Ajouter profil utilisateur | | 1 | Équipe 3
| Modification profil utilisateur | | 3 | Équipe 3

### Notifications
| Item                  |  | Niveau de priorité  | Équipe |
|------------------------|--|-----------------|---|
| Suppression des notifications liés aux rendez-vous/agendas quand ceux-ci sont supprimés | | 1 | Équipe 1
| Les notifications sont un menu déroulant quand on clique | | 4 | Équipe 1

### Affichage
| Item                  |  | Niveau de priorité  | Équipe |
|------------------------|--|-----------------|---|
| Choix d'un thème utilisateur | | 5 | Équipe 3
| Responsive | | 3 | Équipe 3
| Divers affichages du calendrier (+ bug chevauchement) | | 1 | Équipe 3
| Changer bouton retour | | 3 | Équipe 3

## Améliorations

### Backend
| Item                  |  | Niveau de priorité  | Équipe |
|------------------------|--|-----------------|---|
| Unifier les routes + route /api/ + dossier | | 1 | Toutes les équipes
| Hasher le mot de passe | | 1 | Équipe 2


## Spécification du sprint
A l'issue du SPRINT 2, l'expérience utilisateur sera telle que :
- Possibilité de planifier des RDV récurrents, càd qu'il pourra préciser si le RDV se répétera tous les jours, semaines, mois et préciser jusqu'à quand répéter cette récurrence.
- Il pourra rechercher un RDV grâce à une barre de recherche, la recerche pourra être simple : nom, ou plus précise : nom, date, agenda...
- Deux (ou plus) utilisateurs pourront partager un agenda, càd qu'ils pourront ajouter des RDV dans un agenda et ceux-ci pourront être consultés/modifiés/supprimés par n'importe quel utilisateur qui aurait accès à l'agenda partagé. Cet accès pourra être révoqué par le propriétaire de l'agenda. Le système de notification vient parfaire l'expérience des agendas partagés en informant tous les ayant accés de toutes les modifications faites sur ce même agenda partagé. Obtenir l'accès à un agenda se fera sur invitation du propriétaire via un lien d'invitation, ce lien d'invitation aura une date d'expiration. 
- Pour améliorer l'expérience personnelle d'un utilisateur qui partagerait des agendas, il lui sera possible de se créer une identité plus profonde, notamment avec une bio, une photo de profil(?), un nom d'utilisateur unique