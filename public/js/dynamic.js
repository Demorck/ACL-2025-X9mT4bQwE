/**
 * Gestion de la navigation dynamique du calendrier
 */

/**
 * Charge les données du calendrier depuis l'API
    * @param {string} view - La vue demandée (day, week, month)
    * @param {object} params - Les paramètres de date (day, month, year)
 */
async function loadCalendarData(view, params = {}) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = `/api/calendar/${view}?${queryString}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des données');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur:', error);
        return null;
    }
}

/**
 * Met à jour l'affichage du calendrier
 * @param {object} calendarData - Les données du calendrier à afficher
 */
function updateCalendarDisplay(calendarData) {
    const { view, title, html, previous_url, after_url } = calendarData;
    
    // Met à jour le titre (header)
    const titleElement = document.querySelector('.calendar-header .font-semibold');
    if (titleElement) {
        titleElement.textContent = title;
    }
    
    // Mets à jour les liens précédent/suivant
    const prevLink = document.querySelector('.calendar-header a[href*="day="], .calendar-header a[href*="month="]');
    const nextLinks = document.querySelectorAll('.calendar-header a[href*="day="], .calendar-header a[href*="month="]');

    const buttons = document.querySelectorAll('div > a > .calendar-header-button, div > a > .calendar-header-button--active');
    
    buttons.forEach(button => {
        if (button.classList.contains('calendar-header-button--active')) {
            button.classList.remove('calendar-header-button--active');
            button.classList.add('calendar-header-button');
        }

        if (button.parentElement.href.includes(view)) {
            button.classList.add('calendar-header-button--active');
            button.classList.remove('calendar-header-button');
        }
    });

    if (nextLinks.length >= 2) {
        nextLinks[0].href = previous_url;
        nextLinks[nextLinks.length - 1].href = after_url;
    }
    
    // Mets à jour l'attribut data-view du filtre
    const filterContainer = document.querySelector('#container-filter');
    if (filterContainer) {
        filterContainer.dataset.view = view;
    }
    
    // Mets à jour le contenu du calendrier
    const calendarContainer = document.querySelector('.calendar-inner-container');
    if (calendarContainer) {
        calendarContainer.innerHTML = html;
    }
    
    // Réattache les event listeners
    attachCalendarEventListeners();
    
    // Réapplique les filtres d'agendas
    applyAgendaFilters();
    
    // Re-layout des rendez-vous si nécessaire
    if (typeof layoutAppointments === 'function') {
        layoutAppointments();
    }
}

/**
 * Réattache les écouteurs aux éléments du calendrier
 */
function attachCalendarEventListeners() {
    document.querySelectorAll("[data-appointment]").forEach(app => {
        app.addEventListener("click", (e) => {
            const options = {
                method: "POST",
                body: { 
                    day: app.dataset.day,
                    month: app.dataset.month,
                    year: app.dataset.year, 
                    agendaId: app.dataset.agenda,
                    id: app.dataset.id
                }
            };
            openModal("/appointment/edit", "/js/appointments.js", options);
        });
    });
}

/**
 * Réapplique les filtres d'agendas selon l'état des checkboxes
 */
function applyAgendaFilters() {
    const toggles = document.querySelectorAll(".agenda-toggle");
    const view = document.querySelector('#container-filter')?.dataset.view;
    
    if (!view) return;
    
    toggles.forEach(toggle => {
        const agendaId = toggle.value;
        const visible = toggle.checked;
        
        if (view === "month") {
            // Pour la vue mois, on utilise les classes hidden
            document.querySelectorAll(`.appointment-month[data-agenda="${agendaId}"]`)
                .forEach(el => {
                    if (visible) {
                        el.classList.remove("hidden");
                    } else {
                        el.classList.add("hidden");
                    }
                });
        } else {
            // Pour les vues jour/semaine, on utilise display
            document.querySelectorAll(`.appointment[data-agenda='${agendaId}']`)
                .forEach(el => {
                    el.style.display = visible ? "block" : "none";
                });
        }
    });
    
    // Re-layout après application des filtres
    if (typeof layoutAppointments === 'function') {
        layoutAppointments();
    }
}

/**
 * Navigation vers une nouvelle vue
 */
async function navigateToView(view, params = {}) {
    // Charge les données
    const calendarData = await loadCalendarData(view, params);
    if (!calendarData) return;
    
    // Mets à jour l'URL
    const queryString = new URLSearchParams(params).toString();
    const newUrl = `/calendar/${view}${queryString ? '?' + queryString : ''}`;
    history.pushState({ view, params }, '', newUrl);
    
    // Mets à jour l'affichage
    updateCalendarDisplay(calendarData);
}

/**
 * Gère le bouton retour/avant du navigateur
 */
window.addEventListener('popstate', async (event) => {
    if (event.state) {
        const { view, params } = event.state;
        const calendarData = await loadCalendarData(view, params);
        if (calendarData) {
            updateCalendarDisplay(calendarData);
        }
    }
});

/**
 * Initialisation au chargement de la page
 */
document.addEventListener('DOMContentLoaded', () => {
    // Intercepte les clics sur les liens du calendrier
    document.addEventListener('click', async (e) => {
        const link = e.target.closest('a[href^="/calendar/"]');
        if (!link) return;

        if (!window.location.pathname.startsWith("/calendar"))
            return;
            
        
        e.preventDefault();
        
        const url = new URL(link.href, window.location.origin);
        const pathParts = url.pathname.split('/');
        const view = pathParts[2] || 'week';
        
        const params = {};
        url.searchParams.forEach((value, key) => {
            params[key] = value;
        });
        
        await navigateToView(view, params);
    });
    
    // Définit l'état initial dans l'historique
    const pathParts = window.location.pathname.split('/');
    const currentView = pathParts[2] || 'week';
    const currentParams = {};
    new URLSearchParams(window.location.search).forEach((value, key) => {
        currentParams[key] = value;
    });
    
    history.replaceState({ view: currentView, params: currentParams }, '', window.location.href);
    
    // Attache les écouteurs initiaux
    attachCalendarEventListeners();
});