// Configuración dinámica del backend
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080'
    : 'https://fnafhs-academy-backend.onrender.com';

document.addEventListener('DOMContentLoaded', function() {
    const defaultImage = 'https://via.placeholder.com/300x300?text=FNAFHS';
    const filterBtn = document.getElementById('filterBtn');
    const filterPanel = document.getElementById('filterPanel');
    const closeFilter = document.getElementById('closeFilter');
    const applyFilter = document.getElementById('applyFilter');
    const resetFilter = document.getElementById('resetFilter');
    const categorySelect = document.getElementById('categorySelect');
    const modal = document.getElementById('modal');
    const modalClose = document.querySelector('.modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalImage = document.getElementById('modal-image');
    const modalSecondImage = document.getElementById('modal-second-image');
    const modalDescription = document.getElementById('modal-description');
    const showSecondImageBtn = document.getElementById('showSecondImageBtn');
    const secondImageWrapper = document.getElementById('secondImageWrapper');
    const itemsGrid = document.getElementById('itemsGrid');

    let currentPersonaje = null;
    let todosLosPersonajes = [];

    async function cargarPersonajes() {
        try {
            const response = await fetch(API_URL + '/api/personajes/activos');
            if (!response.ok) throw new Error('Error al cargar personajes');
            todosLosPersonajes = await response.json();
            renderizarPersonajes(todosLosPersonajes);
        } catch (error) {
            console.error(error);
            if (itemsGrid) itemsGrid.innerHTML = '<div class="col-12 text-center">Error al cargar personajes</div>';
        }
    }

    function renderizarPersonajes(personajes) {
        if (!itemsGrid) return;
        if (personajes.length === 0) {
            itemsGrid.innerHTML = '<div class="col-12 text-center">No hay personajes disponibles</div>';
            return;
        }
        itemsGrid.innerHTML = '';
        personajes.forEach(p => {
            const item = document.createElement('div');
            item.className = 'item';
            item.setAttribute('data-category', p.categoria || 'otros');
            item.setAttribute('data-id', p.id);
            item.textContent = p.nombre;
            item.onclick = () => abrirModal(p);
            itemsGrid.appendChild(item);
        });
    }

    function abrirModal(personaje) {
        currentPersonaje = personaje;
        modalTitle.textContent = personaje.nombre;
        const imagenUrl = personaje.imagenUrl || defaultImage;
        modalImage.src = imagenUrl;
        if (personaje.imagenOriginalUrl) {
            modalSecondImage.src = personaje.imagenOriginalUrl;
            showSecondImageBtn.disabled = false;
            showSecondImageBtn.style.opacity = '1';
            showSecondImageBtn.style.cursor = 'pointer';
        } else {
            showSecondImageBtn.disabled = true;
            showSecondImageBtn.style.opacity = '0.5';
            showSecondImageBtn.style.cursor = 'not-allowed';
        }
        modalDescription.textContent = personaje.descripcion || `Comparación entre ${personaje.nombre} de FNAFHS Academy y su versión original de Five Nights at Freddy's`;
        secondImageWrapper.style.display = 'none';
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    if (showSecondImageBtn) {
        let segundaVisible = false;
        showSecondImageBtn.onclick = function() {
            if (!currentPersonaje || !currentPersonaje.imagenOriginalUrl) return;
            if (segundaVisible) {
                secondImageWrapper.style.display = 'none';
                showSecondImageBtn.textContent = '🔄 Ver comparación con FNAF original';
                segundaVisible = false;
            } else {
                secondImageWrapper.style.display = 'block';
                showSecondImageBtn.textContent = '✖ Ocultar comparación';
                segundaVisible = true;
            }
        };
    }

    if (modalClose) {
        modalClose.onclick = function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            secondImageWrapper.style.display = 'none';
            if (showSecondImageBtn) {
                showSecondImageBtn.textContent = '🔄 Ver comparación con FNAF original';
            }
        };
    }

    window.onclick = function(e) {
        if (e.target == modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            secondImageWrapper.style.display = 'none';
            if (showSecondImageBtn) {
                showSecondImageBtn.textContent = '🔄 Ver comparación con FNAF original';
            }
        }
    };

    function aplicarFiltro() {
        const categoria = categorySelect.value;
        const items = document.querySelectorAll('.item');
        items.forEach(item => {
            const catItem = item.getAttribute('data-category');
            if (categoria === 'todos' || catItem === categoria) {
                item.classList.remove('oculto');
            } else {
                item.classList.add('oculto');
            }
        });
    }

    if (applyFilter) {
        applyFilter.onclick = () => {
            aplicarFiltro();
            if (filterPanel) filterPanel.classList.remove('active');
            if (filterBtn) filterBtn.classList.remove('active');
        };
    }

    if (resetFilter) {
        resetFilter.onclick = () => {
            categorySelect.value = 'todos';
            aplicarFiltro();
            if (filterPanel) filterPanel.classList.remove('active');
            if (filterBtn) filterBtn.classList.remove('active');
        };
    }

    if (filterBtn) {
        filterBtn.onclick = (e) => {
            e.stopPropagation();
            if (filterPanel) filterPanel.classList.toggle('active');
            if (filterBtn) filterBtn.classList.toggle('active');
        };
    }

    if (closeFilter) {
        closeFilter.onclick = () => {
            if (filterPanel) filterPanel.classList.remove('active');
            if (filterBtn) filterBtn.classList.remove('active');
        };
    }

    document.onclick = (e) => {
        if (filterPanel && filterBtn) {
            if (!filterPanel.contains(e.target) && !filterBtn.contains(e.target)) {
                filterPanel.classList.remove('active');
                filterBtn.classList.remove('active');
            }
        }
    };

    cargarPersonajes();
});