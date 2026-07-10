/* ============================================================
   VALENTIN — PORTFOLIO SCRIPT (vanilla JS, no dependencies)
   ------------------------------------------------------------
   Features
     1.  CONFIG (edit typing words here)
     2.  Preloader fade-out
     3.  Typing effect
     4.  Navbar: scroll state, mobile menu, active link
     5.  Scroll progress bar
     6.  Scroll reveal (IntersectionObserver)
     7.  Custom cursor (fine-pointer devices only)
     8.  Skill-card pointer sheen
     9.  Back-to-top button
     10. Contact form (front-end demo handler)
     11. Footer year
   ============================================================ */
(function () {
  "use strict";

  /* --------------------------------------------------------
     1. CONFIG — the main things you might want to tweak
     -------------------------------------------------------- */
  const CONFIG = {
    // Words cycled by the hero typing effect. EDIT freely.
    typedWords: [
      "an IT specialist in training.",
      "into servers & networks.",
      "a Linux & open-source fan.",
      "a Discord bot developer.",
      "a Minecraft server developer.",
    ],
    typeSpeed: 70,      // ms per character typed
    deleteSpeed: 40,    // ms per character deleted
    holdTime: 1600,     // ms to hold a full word before deleting

    // Where the contact form sends mail (opens the user's mail client).
    contactEmail: "valentin.work1503@gmail.com",
  };

  // Respect users who prefer reduced motion
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Run once the DOM is ready
  document.addEventListener("DOMContentLoaded", init);

  function init() {
    setupPreloader();
    setupTyping();
    setupNavbar();
    setupScrollProgress();
    setupScrollReveal();
    setupCursor();
    setupSkillSheen();
    setupBackToTop();
    setupContactForm();
    setYear();
  }

  /* --------------------------------------------------------
     2. PRELOADER
     -------------------------------------------------------- */
  function setupPreloader() {
    const loader = document.getElementById("loader");
    if (!loader) return;
    const hide = () => {
      loader.classList.add("is-hidden");
      // Remove from the accessibility tree entirely once gone
      setTimeout(() => loader.remove(), 700);
    };
    // Hide on full load, with a hard fallback so it never sticks
    window.addEventListener("load", () => setTimeout(hide, 400));
    setTimeout(hide, 2500);
  }

  /* --------------------------------------------------------
     3. TYPING EFFECT
     -------------------------------------------------------- */
  function setupTyping() {
    const el = document.getElementById("typed");
    if (!el) return;

    const words = CONFIG.typedWords;

    // Reduced motion: just show the first word, no animation
    if (reduceMotion) {
      el.textContent = words[0];
      return;
    }

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const current = words[wordIndex];

      if (!deleting) {
        el.textContent = current.slice(0, ++charIndex);
        if (charIndex === current.length) {
          deleting = true;
          return setTimeout(tick, CONFIG.holdTime);
        }
      } else {
        el.textContent = current.slice(0, --charIndex);
        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
      }
      setTimeout(tick, deleting ? CONFIG.deleteSpeed : CONFIG.typeSpeed);
    }
    tick();
  }

  /* --------------------------------------------------------
     4. NAVBAR — scroll state, mobile toggle, active links
     -------------------------------------------------------- */
  function setupNavbar() {
    const nav = document.getElementById("nav");
    const toggle = document.getElementById("navToggle");
    const menu = document.getElementById("navMenu");
    const links = Array.from(document.querySelectorAll(".nav__link"));

    // Glass background after scrolling a little
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Mobile hamburger
    const closeMenu = () => {
      menu.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    // Close after selecting a link, or pressing Escape
    links.forEach((l) => l.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    // Active-section highlighting via IntersectionObserver
    const sections = links
      .map((l) => document.querySelector(l.getAttribute("href")))
      .filter(Boolean);

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            links.forEach((l) =>
              l.classList.toggle("is-active", l.getAttribute("href") === "#" + id)
            );
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* --------------------------------------------------------
     5. SCROLL PROGRESS BAR
     -------------------------------------------------------- */
  function setupScrollProgress() {
    const bar = document.getElementById("scrollProgress");
    if (!bar) return;
    const update = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
      bar.style.width = Math.min(scrolled * 100, 100) + "%";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* --------------------------------------------------------
     6. SCROLL REVEAL
     -------------------------------------------------------- */
  function setupScrollReveal() {
    const items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    // No IntersectionObserver support, or reduced motion → show all
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.getAttribute("data-reveal-delay");
            if (delay) entry.target.style.setProperty("--reveal-delay", delay + "ms");
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target); // reveal once
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => observer.observe(el));
  }

  /* --------------------------------------------------------
     7. CUSTOM CURSOR (fine pointers only)
     -------------------------------------------------------- */
  function setupCursor() {
    const dot = document.getElementById("cursorDot");
    const ring = document.getElementById("cursorRing");
    if (!dot || !ring) return;

    // Skip on touch / coarse pointers and reduced motion
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer || reduceMotion) return;

    document.body.classList.add("has-cursor");

    let mouseX = 0, mouseY = 0;   // real mouse position
    let ringX = 0, ringY = 0;     // eased ring position

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + "px";
      dot.style.top = mouseY + "px";
      dot.style.opacity = ring.style.opacity = "1";
    });

    // Smoothly trail the ring behind the dot
    (function render() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = ringX + "px";
      ring.style.top = ringY + "px";
      requestAnimationFrame(render);
    })();

    // Enlarge ring over interactive elements
    const interactive = "a, button, input, textarea, .skill-card, .project-card, .nav__toggle";
    document.querySelectorAll(interactive).forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-hovering"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-hovering"));
    });

    // Hide when leaving the window
    document.addEventListener("mouseleave", () => {
      dot.style.opacity = ring.style.opacity = "0";
    });
  }

  /* --------------------------------------------------------
     8. SKILL-CARD POINTER SHEEN
     Feeds the pointer position into CSS custom props so the
     radial highlight follows the cursor.
     -------------------------------------------------------- */
  function setupSkillSheen() {
    if (reduceMotion) return;
    document.querySelectorAll(".skill-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  }

  /* --------------------------------------------------------
     9. BACK-TO-TOP
     -------------------------------------------------------- */
  function setupBackToTop() {
    const btn = document.getElementById("toTop");
    if (!btn) return;
    const toggle = () => btn.classList.toggle("is-visible", window.scrollY > 600);
    toggle();
    window.addEventListener("scroll", toggle, { passive: true });
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* --------------------------------------------------------
     10. CONTACT FORM
     No backend needed (great for GitHub Pages): on submit this
     opens the visitor's email client with the message pre-filled,
     addressed to CONFIG.contactEmail. To use a real form service
     instead (e.g. Formspree), swap the mailto build for a fetch().
     -------------------------------------------------------- */
  function setupContactForm() {
    const form = document.getElementById("contactForm");
    const note = document.getElementById("formNote");
    if (!form || !note) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Basic validation
      if (!form.checkValidity()) {
        note.textContent = "Please fill in all fields with valid details.";
        note.className = "contact__form-note is-error";
        return;
      }

      const name = form.querySelector("#cf-name").value.trim();
      const email = form.querySelector("#cf-email").value.trim();
      const message = form.querySelector("#cf-message").value.trim();

      // Build a mailto link and open the visitor's email client
      const subject = encodeURIComponent(`Portfolio contact from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      window.location.href = `mailto:${CONFIG.contactEmail}?subject=${subject}&body=${body}`;

      note.textContent = "Opening your email app… if nothing happens, email me directly.";
      note.className = "contact__form-note is-success";
    });
  }

  /* --------------------------------------------------------
     11. FOOTER YEAR
     -------------------------------------------------------- */
  function setYear() {
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }
})();
