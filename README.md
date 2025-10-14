# Application de Gestion d’Agendas

## Description du projet
Ce projet consiste à développer une **application web de gestion d’agendas** en équipe.  
L’application repose sur une **architecture client-serveur** et permet aux utilisateurs de gérer leurs calendriers personnels ou partagés depuis une interface web.

L’objectif est de proposer une solution complète permettant la **création, la modification, la visualisation et le partage d’agendas**, tout en assurant la **persistance des données** entre les sessions.

---

## Fonctionnalités principales

### Fonctionnalités créées
- **Visulation d'un calendrier et d'une journée**
- **Authentification utilisateur** : connexion et déconnexion sécurisées  

### Fonctionnalités en cours
- **Authentification utilisateur** : connexion et déconnexion sécurisées
- 
### Fonctionnalités prévues
- **Rendez-vous récurrents**
- **Recherche par critères (date, titre, participant, etc.)**
- **Partage et annulation de partage d’agendas**
- **Import / export d’agenda** (format libre)
- **Création d’agendas**  
- **Ajout / suppression / modification de rendez-vous**  
- **Visualisation simultanée de plusieurs agendas**

---

## Architecture

L’application repose sur une **architecture client-serveur unique** :

### Serveur (Node.js + Express)
- Sert les pages web  
- Assure la **persistance des données** (MongoDB)  
- Écoute sur le **port 3000** par défaut

### Client (HTML / CSS / JavaScript)
- Rendu de page avec EJS
- Framework CSS: Tailwind

---

## Persistance des données
Une base de données va être créée avec MongoDB

---

## Installation et exécution

### Prérequis
- [Node.js](https://nodejs.org/) (v18 ou plus)
- [npm](https://www.npmjs.com/)

### Installation
```bash
git clone https://github.com/Demorck/ACL-2025-X9mT4bQwE.git
cd ACL-2025-X9mT4bQwE
npm install
npm start
```

