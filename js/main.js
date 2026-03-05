/* ================================================
   GENAIR — main.js
   Filosofía: KISS — funciones claras, sin librerías
   Controla:
   1. Header scroll (.is-scrolled)
   2. Hamburger + nav móvil (.is-open)
   3. Dropdown móvil (.is-open en .has-dropdown)
   4. Slider (auto + flechas + puntos + swipe)
   5. WhatsApp flotante (.is-visible)
   6. Animaciones scroll (Intersection Observer)
   7. Formulario de contacto (validación básica)
================================================ */

(function () {
  'use strict';

  /* ── REFERENCIAS ─────────────────────────────── */
  const header        = document.getElementById('header');
  const hamburger     = document.getElementById('hamburger');
  const nav           = document.getElementById('nav');
  const sliderTrack   = document.getElementById('slider-track');
  const btnPrev       = document.getElementById('slider-prev');
  const btnNext       = document.getElementById('slider-next');
  const dotsContainer = document.getElementById('slider-dots');
  const waFloat       = document.getElementById('whatsapp-float');
  const contactForm   = document.getElementById('contact-form');

  const slides = sliderTrack
    ? Array.from(sliderTrack.querySelectorAll('.slide'))
    : [];
  const dots = dotsContainer
    ? Array.from(dotsContainer.querySelectorAll('.dot'))
    : [];


  /* ════════════════════════════════════════════════
     1. HEADER SCROLL
  ════════════════════════════════════════════════ */
  function onScroll() {
    if (!header) return;

    header.classList.toggle('is-scrolled', window.scrollY > 10);

    if (waFloat) {
      waFloat.classList.toggle('is-visible', window.scrollY > 300);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });


  /* ════════════════════════════════════════════════
     2. HAMBURGER + NAV MÓVIL
  ════════════════════════════════════════════════ */
  if (hamburger && nav) {

    hamburger.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Cerrar al hacer click en cualquier link del nav en móvil
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
          nav.classList.remove('is-open');
          hamburger.classList.remove('is-open');
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    });

    // Cerrar nav al redimensionar a desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) {
        nav.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }


  /* ════════════════════════════════════════════════
     3. DROPDOWN — control 100% desde JS
     Desktop y móvil: click toggle .is-open
     Se cierra al hacer click fuera o en un link
  ════════════════════════════════════════════════ */
  const dropdowns = Array.from(document.querySelectorAll('.has-dropdown'));

  function closeAllDropdowns() {
    dropdowns.forEach(function (d) { d.classList.remove('is-open'); });
  }

  dropdowns.forEach(function (item) {
    const toggle = item.querySelector('.dropdown-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      const isOpen = item.classList.contains('is-open');
      closeAllDropdowns();
      if (!isOpen) item.classList.add('is-open');
    });

    // Cerrar al hacer click en un link del dropdown
    item.querySelectorAll('.dropdown a').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const href = link.getAttribute('href');

        closeAllDropdowns();

        if (window.innerWidth <= 768 && nav && hamburger) {
          nav.classList.remove('is-open');
          hamburger.classList.remove('is-open');
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }

        // Pequeño delay para que el DOM procese el cierre antes de navegar
        setTimeout(function () {
          window.location.href = href;
        }, 80);
      });
    });
  });

  // Cerrar dropdown al hacer click fuera
  document.addEventListener('click', function (e) {
    const clickedInsideDropdown = e.target.closest('.has-dropdown');
    if (!clickedInsideDropdown) {
      closeAllDropdowns();
    }
  });

  // Cerrar dropdown con tecla Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAllDropdowns();
  });


  /* ════════════════════════════════════════════════
     4. SLIDER
  ════════════════════════════════════════════════ */
  if (slides.length > 0) {

    let current   = 0;
    let autoTimer = null;
    const INTERVAL = 5000;

    function goTo(index) {
      slides[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('active');

      current = (index + slides.length) % slides.length;

      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(next, INTERVAL);
    }

    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    // Flechas
    if (btnNext) btnNext.addEventListener('click', function () { next(); stopAuto(); startAuto(); });
    if (btnPrev) btnPrev.addEventListener('click', function () { prev(); stopAuto(); startAuto(); });

    // Puntos
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goTo(parseInt(dot.getAttribute('data-slide'), 10));
        stopAuto();
        startAuto();
      });
    });

    // Swipe táctil
    let touchStartX = 0;
    sliderTrack.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    sliderTrack.addEventListener('touchend', function (e) {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
        stopAuto();
        startAuto();
      }
    }, { passive: true });

    // Pausar al hacer hover
    const heroSlider = document.getElementById('hero-slider');
    if (heroSlider) {
      heroSlider.addEventListener('mouseenter', stopAuto);
      heroSlider.addEventListener('mouseleave', startAuto);
    }

    // Pausar cuando la pestaña no está visible
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stopAuto() : startAuto();
    });

    startAuto();
  }


  /* ════════════════════════════════════════════════
     5. ANIMACIONES SCROLL — Intersection Observer
     Clases que se agregan al entrar al viewport:
     .fade-up   → sube y aparece
     .fade-in   → solo aparece
     .fade-left → viene desde la izquierda
     .fade-right→ viene desde la derecha

     El SASS controla el estado inicial (opacity:0 + transform)
     y el estado final (.visible)
  ════════════════════════════════════════════════ */
  const animatedEls = document.querySelectorAll(
    '.fade-up, .fade-in, .fade-left, .fade-right, ' +
    '.value-card, .why-card, .mv-card, ' +
    '.product-card, .service-card, .support-card, ' +
    '.split-img, .split-text, ' +
    '.contact-info, .contact-form-wrap'
  );

  if (animatedEls.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // solo una vez
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    animatedEls.forEach(function (el) {
      observer.observe(el);
    });
  }


  /* ════════════════════════════════════════════════
     6. ANIMACIÓN STAGGER — cards en grid
     Aplica delay progresivo a hijos de un grid
     para que aparezcan uno a uno
  ════════════════════════════════════════════════ */
  const staggerGrids = document.querySelectorAll(
    '.values-grid, .why-grid, .products-grid, ' +
    '.services-grid, .support-grid, .mv-grid'
  );

  staggerGrids.forEach(function (grid) {
    Array.from(grid.children).forEach(function (child, i) {
      child.style.transitionDelay = (i * 0.08) + 's';
    });
  });


  /* ════════════════════════════════════════════════
     7. FORMULARIO DE CONTACTO
     Validación básica antes de enviar
  ════════════════════════════════════════════════ */
  if (contactForm) {

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const fields  = contactForm.querySelectorAll('[required]');
      let   isValid = true;

      // Limpiar errores previos
      contactForm.querySelectorAll('.field-error').forEach(function (el) {
        el.remove();
      });
      contactForm.querySelectorAll('.input-error').forEach(function (el) {
        el.classList.remove('input-error');
      });

      // Validar cada campo requerido
      fields.forEach(function (field) {
        const value = field.value.trim();
        let   error = '';

        if (!value) {
          error = 'Este campo es obligatorio.';
        } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Ingresa un correo válido.';
        } else if (field.type === 'tel' && !/^[\d\s\+\-\(\)]{7,}$/.test(value)) {
          error = 'Ingresa un teléfono válido.';
        }

        if (error) {
          isValid = false;
          field.classList.add('input-error');

          const msg = document.createElement('span');
          msg.className   = 'field-error';
          msg.textContent = error;
          field.parentNode.appendChild(msg);
        }
      });

      if (!isValid) return;

      // Si todo OK — feedback visual
      const btn = contactForm.querySelector('button[type="submit"]');
      const original = btn.textContent;

      btn.textContent = '¡Mensaje enviado!';
      btn.disabled    = true;
      btn.style.background = '#1ebe5d';

      // Resetear después de 3 segundos
      setTimeout(function () {
        contactForm.reset();
        btn.textContent  = original;
        btn.disabled     = false;
        btn.style.background = '';
      }, 3000);
    });
  }


  /* ════════════════════════════════════════════════
     8. HOVER OVERLAY — soporte-tecnico
     Las tarjetas .support-card son <a> entonces
     el hover del overlay lo maneja el CSS/SASS.
     Este bloque es solo para accesibilidad con teclado.
  ════════════════════════════════════════════════ */
  document.querySelectorAll('.support-card').forEach(function (card) {
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.location.href = card.getAttribute('href');
      }
    });
  });


})();
