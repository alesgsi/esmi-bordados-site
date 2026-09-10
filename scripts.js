/* ESMI Bordados — comportamiento de la página */
(() => {
  "use strict";

  const header = document.getElementById("site-header");
  const menu = document.getElementById("menu");
  const menuButton = document.getElementById("menu-btn");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Menú móvil ---------------------------------------------------------- */
  const setMenu = (open) => {
    menu.classList.toggle("active", open);
    menuButton.classList.toggle("active", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.body.classList.toggle("menu-open", open);
  };

  menuButton.addEventListener("click", () => {
    setMenu(!menu.classList.contains("active"));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  /* Sombra de la cabecera al hacer scroll -------------------------------- */
  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Aparición progresiva de secciones ------------------------------------ */
  const revealElements = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((el) => el.classList.add("visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
  }

  /* Resaltado del enlace de la sección visible --------------------------- */
  const navLinks = [...menu.querySelectorAll('a[href^="#"]')].filter(
    (link) => !link.classList.contains("menu-cta")
  );
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const visible = new Set();

    const syncActive = () => {
      // Con varias secciones en pantalla, marcamos la que está más arriba.
      const top = [...visible].sort(
        (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top
      )[0];
      navLinks.forEach((link) => {
        link.classList.toggle(
          "is-active",
          Boolean(top) && link.getAttribute("href") === `#${top.id}`
        );
      });
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
        syncActive();
      },
      { rootMargin: "-25% 0px -55% 0px" }
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* Lightbox de la galería ----------------------------------------------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const items = [...document.querySelectorAll(".gallery-item")];
  let index = 0;
  let lastFocused = null;

  const show = (i) => {
    index = (i + items.length) % items.length;
    const item = items[index];
    const thumb = item.querySelector("img");
    lightboxImg.src = item.dataset.full;
    lightboxImg.alt = thumb ? thumb.alt : "";
    lightboxCaption.textContent = item.dataset.caption || "";
  };

  const openLightbox = (i) => {
    lastFocused = document.activeElement;
    show(i);
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    // Un frame de espera para que la transición de opacidad se aplique.
    requestAnimationFrame(() => lightbox.classList.add("is-open"));
    document.getElementById("lightbox-close").focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    document.body.classList.remove("lightbox-open");
    const hide = () => {
      lightbox.hidden = true;
      lightboxImg.removeAttribute("src");
    };
    if (reduceMotion) hide();
    else setTimeout(hide, 200);
    if (lastFocused) lastFocused.focus();
  };

  items.forEach((item, i) => item.addEventListener("click", () => openLightbox(i)));

  if (lightbox) {
    document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
    document.getElementById("lightbox-prev").addEventListener("click", () => show(index - 1));
    document.getElementById("lightbox-next").addEventListener("click", () => show(index + 1));

    lightbox.addEventListener("click", (event) => {
      // Cerrar solo al tocar el fondo, no la foto ni los controles.
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (event) => {
      if (lightbox.hidden) return;
      if (event.key === "Escape") closeLightbox();
      else if (event.key === "ArrowLeft") show(index - 1);
      else if (event.key === "ArrowRight") show(index + 1);
      else if (event.key === "Tab") {
        // El diálogo es modal: mantenemos el foco dentro.
        const focusables = lightbox.querySelectorAll("button");
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* Año del pie de página ------------------------------------------------ */
  const year = document.getElementById("footer-year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
