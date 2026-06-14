// Configuración dinámica del backend
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080'
    : 'https://fnafhs-academy-backend.onrender.com';

document.addEventListener('DOMContentLoaded', function() {
    const defaultImage = 'https://via.placeholder.com/300x300?text=Arte';
    const filterBtn = document.getElementById('filterArteBtn');
    const filterPanel = document.getElementById('filterArtePanel');
    const closeFilter = document.getElementById('closeArteFilter');
    const applyFilter = document.getElementById('applyArteFilter');
    const resetFilter = document.getElementById('resetArteFilter');
    const categorySelect = document.getElementById('arteCategorySelect');
    const arteGrid = document.getElementById('arteGrid');
    const modal = document.getElementById('fullscreenModal');
    const modalClose = document.querySelector('.fullscreen-close');
    const fullImage = document.getElementById('fullscreenImage');
    const comicNav = document.getElementById('comicNav');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageCounter = document.getElementById('pageCounter');

    let currentComicId = null;
    let currentPage = 1;
    let totalPages = 1;
    let comicPages = [];
    let todasLasArtes = [];

    async function cargarArte() {
        try {
            const response = await fetch(API_URL + '/api/arte');
            if (!response.ok) throw new Error('Error al cargar arte');
            todasLasArtes = await response.json();
            renderizarArte(todasLasArtes);
        } catch (error) {
            console.error(error);
            if (arteGrid) arteGrid.innerHTML = '<div class="col-12 text-center">Error al cargar arte</div>';
        }
    }

    function renderizarArte(arteItems) {
        if (!arteGrid) return;
        if (arteItems.length === 0) {
            arteGrid.innerHTML = '<div class="col-12 text-center">No hay elementos de arte disponibles</div>';
            return;
        }
        arteGrid.innerHTML = '';
        arteItems.forEach(arte => {
            const item = document.createElement('div');
            item.className = 'arte-item';
            item.setAttribute('data-type', arte.tipo);
            item.setAttribute('data-id', arte.id);
            const img = document.createElement('img');
            img.src = arte.imagenUrl || defaultImage;
            img.alt = arte.titulo;
            img.onerror = () => { img.src = defaultImage; };
            item.appendChild(img);
            if (arte.tipo === 'comic') {
                item.setAttribute('data-comic', arte.comicId);
                item.setAttribute('data-pages', arte.totalPaginas);
            }
            item.onclick = () => {
                if (arte.tipo === 'comic') {
                    abrirComic(arte.comicId, arte.imagenUrl, arte.totalPaginas);
                } else {
                    abrirImagen(arte.imagenUrl);
                }
            };
            arteGrid.appendChild(item);
        });
    }

    async function abrirComic(comicId, primeraImagen, totalPag) {
        try {
            const response = await fetch(API_URL + `/api/arte/comic/${comicId}`);
            const imagenes = await response.json();
            comicPages = imagenes.map(img => img.imagenUrl);
            totalPages = comicPages.length;
            currentComicId = comicId;
            currentPage = 1;
            fullImage.src = comicPages[0];
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            comicNav.style.display = 'flex';
            pageCounter.textContent = `${currentPage} / ${totalPages}`;
        } catch (error) {
            console.error(error);
            abrirImagen(primeraImagen);
        }
    }

    function abrirImagen(src) {
        fullImage.src = src;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        comicNav.style.display = 'none';
        currentComicId = null;
    }

    function cambiarPagina(direccion) {
        if (!currentComicId) return;
        let nuevaPagina = currentPage + direccion;
        if (nuevaPagina < 1) nuevaPagina = 1;
        if (nuevaPagina > totalPages) nuevaPagina = totalPages;
        if (nuevaPagina !== currentPage) {
            currentPage = nuevaPagina;
            fullImage.src = comicPages[currentPage - 1];
            pageCounter.textContent = `${currentPage} / ${totalPages}`;
        }
    }

    if (prevBtn) prevBtn.onclick = () => cambiarPagina(-1);
    if (nextBtn) nextBtn.onclick = () => cambiarPagina(1);
    if (modalClose) modalClose.onclick = () => { modal.style.display = 'none'; document.body.style.overflow = 'auto'; currentComicId = null; };
    window.onclick = (e) => { if (e.target === modal) { modal.style.display = 'none'; document.body.style.overflow = 'auto'; currentComicId = null; } };
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'block' && currentComicId) {
            if (e.key === 'ArrowLeft') cambiarPagina(-1);
            else if (e.key === 'ArrowRight') cambiarPagina(1);
            else if (e.key === 'Escape') { modal.style.display = 'none'; document.body.style.overflow = 'auto'; currentComicId = null; }
        }
    });

    function aplicarFiltro() {
        const categoria = categorySelect.value;
        const items = document.querySelectorAll('.arte-item');
        items.forEach(item => {
            const tipo = item.getAttribute('data-type');
            if (categoria === 'todos' || tipo === categoria) {
                item.classList.remove('oculto');
            } else {
                item.classList.add('oculto');
            }
        });
    }

    if (applyFilter) applyFilter.onclick = () => { aplicarFiltro(); if (filterPanel) filterPanel.classList.remove('active'); };
    if (resetFilter) resetFilter.onclick = () => { categorySelect.value = 'todos'; aplicarFiltro(); if (filterPanel) filterPanel.classList.remove('active'); };
    if (filterBtn) filterBtn.onclick = (e) => { e.stopPropagation(); if (filterPanel) filterPanel.classList.toggle('active'); };
    if (closeFilter) closeFilter.onclick = () => { if (filterPanel) filterPanel.classList.remove('active'); };
    document.onclick = (e) => { if (filterPanel && filterBtn && !filterPanel.contains(e.target) && !filterBtn.contains(e.target)) filterPanel.classList.remove('active'); };
    cargarArte();
});