/* Wildflower Canines — site behavior */

// Site settings. Form submissions are handled by the backend /api/eval route.
const SITE = {
  social: {
    instagram: "",
    facebook: "",
    tiktok: "",
  },
};

const ICONS = {
  instagram:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
  facebook:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8.5V6.8c0-.8.5-1.3 1.3-1.3H17V2.2h-2.6C11.6 2.2 10.3 4 10.3 6.6v1.9H8v3.3h2.3V22H14V11.8h2.6l.4-3.3H14z"/></svg>',
  tiktok:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 2h-3.3v13.2a2.9 2.9 0 1 1-2.1-2.8V9a6.3 6.3 0 1 0 5.4 6.2V8.6a7.7 7.7 0 0 0 4.4 1.4V6.7a4.4 4.4 0 0 1-4.4-4.4z"/></svg>',
};

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");

  // Mobile nav
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = root.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    document.querySelectorAll(".nav a").forEach((a) =>
      a.addEventListener("click", () => {
        root.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && root.classList.contains("nav-open")) {
        root.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  // Header shadow once the page scrolls
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Gentle reveal on scroll
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  // Footer year and social links
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  document.querySelectorAll("[data-socials]").forEach((wrap) => {
    const links = Object.entries(SITE.social).filter(([, url]) => url);
    if (!links.length) {
      wrap.remove();
      return;
    }
    wrap.innerHTML = links
      .map(
        ([name, url]) =>
          `<a href="${url}" target="_blank" rel="noopener" aria-label="Wildflower Canines on ${name[0].toUpperCase() + name.slice(1)}">${ICONS[name]}</a>`
      )
      .join("");
  });

  initContactForm();
});

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  // Preselect the service when arriving from a service link (?service=board-and-train)
  const wanted = new URLSearchParams(window.location.search).get("service");
  if (wanted) {
    const select = form.querySelector("#service");
    const match = select && [...select.options].find((o) => o.dataset.key === wanted);
    if (match) match.selected = true;
  }

  const status = form.querySelector(".form-status");
  const button = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";
    status.classList.remove("is-error");

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (form.querySelector('[name="_honey"]').value) return;

    const data = Object.fromEntries(new FormData(form).entries());

    button.disabled = true;
    const label = button.textContent;
    button.textContent = "Sending...";

    try {
      const res = await fetch(form.action || "/api/eval", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.ok) === "false") throw new Error(json.error || "Send failed");

      const card = form.closest(".form-card");
      card.innerHTML = `
        <div class="form-success" role="status">
          <img src="/assets/brand/logo-wreath-sm.png" alt="">
          <h2>Thank you, ${escapeHtml(data.name.split(" ")[0])}!</h2>
          <p>Your eval request is on its way. Bri will reach out personally to talk about ${data.dog_name ? escapeHtml(data.dog_name) : "your dog"} and what you're hoping for.</p>
        </div>`;
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      status.textContent = "Something went wrong sending your message. Please try again in a moment.";
      status.classList.add("is-error");
      button.disabled = false;
      button.textContent = label;
    }
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
