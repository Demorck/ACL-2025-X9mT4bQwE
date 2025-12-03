const toastContainer = document.getElementById('toastContainer');

function creerToast(message, type = 'succes') {
  console.log("non tu rentres")
  const toast = document.createElement('div');
  toast.className = 'toast opacity-0 transition-opacity duration-300 bg-white border border-gray-200 shadow-lg rounded-lg p-4 flex items-start w-72';
  const iconClass = choixFA(type);
  toast.innerHTML = `
    <i class="${iconClass} w-5 h-5 mt-1 flex-shrink-0"></i>
    <div class="ml-3 flex-1">
      <p class="text-sm font-medium text-gray-900">Notification</p>
      <p class="text-sm text-gray-500 mt-1">${message}</p>
    </div>
    <button class="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none">
      <i class="fa-solid fa-xmark text-blue-500"></i>
    </button>
  `;
  toast.querySelector('button').addEventListener('click', () => supprimerToast(toast));

  // Ajout dans le container, sans supprimer les autres toasts (mais marche pas parce que ca refresh la page)
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0');
    toast.classList.add('opacity-100');
  });

  // Le toast disparait au bout de 3 secondes 
  setTimeout(() => supprimerToast(toast), 3000);
}

function supprimerToast(toast) {
  toast.classList.remove('opacity-100');
  toast.classList.add('opacity-0');
  setTimeout(() => toast.remove(), 300);
}

/**
 * Retourne la chaîne de classes Font Awesome (FA) pour le type de toast donné.
 * @param {string} type - Le type de toast ('echec', 'supprimer', 'ajouter', etc.)
 * @returns {string} - La chaîne de classes Font Awesome et de couleur.
 */
function choixFA(type) {
  let iconClasses;

  switch (type) {
    case "echec":
      iconClasses = "fa-solid fa-xmark text-red-500";
      break;

    case "supprimer":
      iconClasses = "fa-solid fa-trash-can text-orange-500";
      break;

    case "lu":
      iconClasses = "fa-solid fa-eye text-green-500";
      break;

      // pas utilisé
    case "ajouter":
      iconClasses = "fa-solid fa-plus text-green-500";
      break;

    case "info": // pas utilisé
      iconClasses = "fa-solid fa-circle-info text-blue-500";
      break;

    case "succes": 
      iconClasses = "fa-solid fa-circle-check text-green-500";
      break;

    default:
      iconClasses = "fa-solid fa-circle-dot text-gray-500";
      break;
  }

  return iconClasses;
}


