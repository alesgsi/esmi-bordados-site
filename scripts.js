const menu = document.getElementById("menu");
const button = document.getElementById("menu-btn");

function setMenu(open) {
  menu.classList.toggle("active", open);
  button.classList.toggle("active", open);
  button.setAttribute("aria-expanded", String(open));
  button.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  document.body.classList.toggle("menu-open", open);
}

button.addEventListener("click", () => {
  setMenu(!menu.classList.contains("active"));
});

menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealElements.forEach((element) => revealObserver.observe(element));
