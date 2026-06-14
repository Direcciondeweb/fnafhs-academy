// Configuración dinámica del backend
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080'
    : 'https://fnafhs-academy-backend.onrender.com';

class SliderManager {
    constructor() {
        this.sliderContainer = document.querySelector('.hero-slider');
        this.intervalId = null;
        this.currentSlide = 0;
        this.totalSlides = 0;
        this.autoPlayEnabled = true;
        this.autoPlayDelay = 5000;
    }

    async init() {
        if (!this.sliderContainer) return;
        await this.cargarImagenes();
        this.iniciarAutoPlay();
        this.agregarEventos();
    }

    async cargarImagenes() {
        try {
            const response = await fetch(`${API_URL}/api/slider/activas`);
            const imagenes = await response.json();
            if (!imagenes || imagenes.length === 0) {
                this.sliderContainer.innerHTML = '';
                this.sliderContainer.style.animation = 'none';
                return;
            }
            this.totalSlides = imagenes.length;
            this.renderizarSlides(imagenes);
            this.crearAnimacionDinamica();
        } catch (error) {
            console.error('Error cargando slider:', error);
            this.sliderContainer.innerHTML = '<div class="error-slider">Error al cargar imágenes</div>';
        }
    }

    renderizarSlides(imagenes) {
        let slidesHtml = '';
        imagenes.forEach((img, index) => {
            slidesHtml += `<div class="slide ${index === 0 ? 'active' : ''}" data-index="${index}" style="background-image: url('${img.imagenUrl}');"></div>`;
        });
        this.sliderContainer.innerHTML = slidesHtml;
    }

    crearAnimacionDinamica() {
        if (this.totalSlides <= 1) {
            this.sliderContainer.style.animation = 'none';
            return;
        }
        const duration = this.totalSlides * 6;
        const step = 100 / this.totalSlides;
        let keyframes = '';
        for (let i = 0; i < this.totalSlides; i++) {
            const start = i * step;
            const end = (i + 1) * step;
            keyframes += `${start}%, ${end}% { transform: translateX(-${i * 100}%); }`;
        }
        const oldStyle = document.getElementById('sliderDynamicStyle');
        if (oldStyle) oldStyle.remove();
        const style = document.createElement('style');
        style.id = 'sliderDynamicStyle';
        style.textContent = `@keyframes slideShowDynamic { ${keyframes} }`;
        document.head.appendChild(style);
        this.sliderContainer.style.animation = `slideShowDynamic ${duration}s infinite ease-in-out`;
    }

    iniciarAutoPlay() {
        if (!this.autoPlayEnabled || this.totalSlides <= 1) return;
        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = setInterval(() => { this.siguienteSlide(); }, this.autoPlayDelay);
    }

    siguienteSlide() {
        if (this.totalSlides === 0) return;
        const slides = document.querySelectorAll('.slide');
        if (!slides.length) return;
        slides[this.currentSlide].classList.remove('active');
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        slides[this.currentSlide].classList.add('active');
        if (this.sliderContainer.style.animation === 'none') {
            this.sliderContainer.style.transform = `translateX(-${this.currentSlide * 100}%)`;
        }
    }

    slideAnterior() {
        if (this.totalSlides === 0) return;
        const slides = document.querySelectorAll('.slide');
        if (!slides.length) return;
        slides[this.currentSlide].classList.remove('active');
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        slides[this.currentSlide].classList.add('active');
        if (this.sliderContainer.style.animation === 'none') {
            this.sliderContainer.style.transform = `translateX(-${this.currentSlide * 100}%)`;
        }
    }

    pausarAutoPlay() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    reanudarAutoPlay() {
        if (this.autoPlayEnabled && !this.intervalId && this.totalSlides > 1) {
            this.intervalId = setInterval(() => { this.siguienteSlide(); }, this.autoPlayDelay);
        }
    }

    agregarEventos() {
        this.sliderContainer.addEventListener('mouseenter', () => { this.pausarAutoPlay(); });
        this.sliderContainer.addEventListener('mouseleave', () => { this.reanudarAutoPlay(); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.slideAnterior();
                this.pausarAutoPlay();
                setTimeout(() => this.reanudarAutoPlay(), 10000);
            } else if (e.key === 'ArrowRight') {
                this.siguienteSlide();
                this.pausarAutoPlay();
                setTimeout(() => this.reanudarAutoPlay(), 10000);
            }
        });
    }

    recargar() {
        this.pausarAutoPlay();
        this.currentSlide = 0;
        this.cargarImagenes();
        this.iniciarAutoPlay();
    }
}

// Inicializar slider cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const slider = new SliderManager();
    slider.init();
    window.sliderManager = slider;
});