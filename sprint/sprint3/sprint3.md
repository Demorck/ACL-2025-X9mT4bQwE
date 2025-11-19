# Backlog - sprint 3

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
| Rendez vous récurrents | | 1 | Toutes les équipes
| Modification d'un rendez-vous en drag & drop | | 5 | Équipe 3

### Affichage
| Item                  |  | Niveau de priorité  | Équipe |
|------------------------|--|-----------------|---|
| Personnalisation d'un thème utilisateur | | 5 | Équipe 3
| Recharger les contenus dynamiquements | | 1 | Équipe 3
| Ajout d'un affichage pour voir si on est invité dans le filtre des agendas | | 3 | Équipe 3
| Affichage par année, par décade, par siècle | | 2 | Équipe 3
| Modifier les boutons suivants/précédents pour les mettre au milieu du header du calendrier | | 4 | Équipe 3
| Ajout d'un toast pour les notifications | | 4 | Équipe 1

### Agendas
| Item                  |  | Niveau de priorité  | Équipe |
|------------------------|--|-----------------|---|
| Ajout de rôles pour les agendas partagés | | 2 | Équipe 2
| Importation/exportation | | 2 | Équipe 2

## Améliorations
| Item                  |  | Niveau de priorité  | Équipe |
|------------------------|--|-----------------|---|
| Amélioration barre de recherche | | 2 | Équipe 1

### Backend
| Item                  |  | Niveau de priorité  | Équipe |
|------------------------|--|-----------------|---|
| Unifier les routes + route /api/ + dossier | | 1 | Toutes les équipes


## Spécification du sprint
À l'issue de ce sprint final, l'expérience utilisateur sera telle que:
- L'utilisateur pourra facilement déplacer ses RDV dans son emploi du temps juste en maintenant appuyé avec la souris sur le RDV et en le déplaçant à un autre endroit d'ans l'edt.
- Il pourra avoir un impact sur les RDV récurrents à l'unité. C-à-d qu'ils pourront créer des exceptions dans la récurrence, par exemple dire qu'un seul RDV sera annulé ou reporté sans que cela n'impacte les autres rdv de la récurrence. 
- L'interface du calendrier sera plus lisible et facile à prendre en main/comprendre.
- Les rôles dans les agendas partagés permettront de distinguer quel type d'invité l'utilisateur sera : il pourrait n'avoir accès qu'à la lecture du calendrier partagé, il pourrait être capable de créer sans modifier ou vice-versa, il pourrait finalement avoir le droit de supprimer les RDV.
- On offre la possibilité aux utilisateurs d'exporter leur agenda sous la forme d'un fichier .ics qui pourra être importé par n'importe qui. L'importer crééera un nouvel agenda avec les RDV du fichier .ics ou pourrait être ajouté à un agenda existant de l'utilisateur
- Les utilisateurs vont pouvoir faire des recherches plus précises : nom, date, agenda ...
