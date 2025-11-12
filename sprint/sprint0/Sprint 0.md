# Backlog - sprint 0

## Organisation
Pour ce sprint, nous priorisons les fonctionnalitées suivantes : 
- Conception
- Création d'un compte
- Connexion utilisateur
- Déconnexion utilisateur
- Visualisation de l'agenda lié au compte de l'utilisateur
- Ajout d'un rendez-vous

Nous allons faire deux équipes, une qui s'occupe du compte et une équipe qui s'occupe de l'agenda.  

On va se mettre en plusieurs petites équipes afin de faire le front-end et le back-end des fonctionnalités du sprint courant (plusieurs fonctionnalités par sprint).  
Les équipes pourront changer afin que chaque membre puisse s'occuper des différentes grandes étapes (Utilisateurs, agendas, rendez-vous...).

### Équipes 
Équipe 1 : MALCUIT, HOUSSEIN, GUITTIENNE

Équipe 2 : ANTOINE, MARQUE


## Fonctionnalitées

### Conception & Modélisation
| Item                  |  | Estimation | | Equipe |
|------------------------|--|-------------|----|--|
| Conception*             | | s0         | | Équipe 1 & 2 |
\* La conception du projet implique l'emsemble des membres du groupe lors du premier sprint (s0) (Conception : architecture, frameWork, maquettes,...).

### Utilisateurs
| Item                  |  | Estimation |  | Equipe |
|------------------------|--|-----------------|--|-|
| Création d'un compte (implique la création automatique d'un agenda)      | | s0 | | Équipe 1 |
| Connexion utilisateur   | | s0 | | Équipe 1 |
| Déconnexion utilisateur | | s0 | | Équipe 1 |

### Agendas
| Item                               |  | Estimation | | Equipe |
|------------------------------------|---|----|--------------|--|
| Visualisation de l'agenda lié au compte de l'utilisateur                |  | s0 | | Équipe 2 |
| Ajout d'un rendez-vous                |  | s0 | | Équipe 2 |

## Spécification du sprint
À l'issue du SPRINT 0, l'expérience d'un utilisateur sera telle que :  
Un utilisateur voulant se créer un compte le pourra, il pourra se connecter à ce même compte et seulement à ce compte.  
Il pourra se déconnecter de sa session en cours et revenir plus s'il le souhaite.
Un utilisateur qui voudrait utiliser les fonctionnalités de l'agenda serait forcé de se créer un compte s'il n'en a pas encore un.  
Un utilisateur aura un agenda unique non global (c-à-d que seul lui pourra le visualiser et ajouter des RDV). Il sera créé automatiquement après la création de son compte. Sur son interface utilisateur, il pourra visualiser les jours du calendrier avec les RDV déjà planifiés en jour et en heure. Sur cet même interface, il aura un bouton "ajouter un rendez-vous" qui lui permettra d'ajouter un RDV en précisant son titre, son jour et son heure de début et de fin. Ce RDV sera enregistré sur SON calendrier associé à son compte.  
Suite à la connexion d'un compte, l'utilisateur arrive sur la page de visualisation du calendrier lié à son compte. 