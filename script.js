/* ============================================================
   VALENTIN — PORTFOLIO
     1. scroll progress + ghost-number parallax
     2. active rail link
     3. pointer effects (glow, tilt, magnetic)
     4. scroll-in reveal
     5. 3D Minecraft skin viewer
   Headlines and body copy are animated in scroll-effects.js.
   ============================================================ */
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelector("#year").textContent = new Date().getFullYear();

/* ---------- 1. scroll progress + parallax ---------- */
const progress = document.querySelector(".progress span");
const projects = [...document.querySelectorAll(".project")];
const sections = [...document.querySelectorAll("main > section[id]")];
const railLinks = [...document.querySelectorAll(".rail nav a")];

let ticking = false;

function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max ? scrollY / max : 0})`;

  // The oversized project numbers drift against the scroll direction.
  if (!reduced) {
    projects.forEach(card => {
      const box = card.getBoundingClientRect();
      const centered = (box.top + box.height / 2 - innerHeight / 2) / innerHeight;
      card.style.setProperty("--project-shift", `${Math.max(-26, Math.min(26, centered * -26))}px`);
    });
  }

  /* ---------- 2. active rail link ---------- */
  const current = sections.filter(s => s.getBoundingClientRect().top <= innerHeight * 0.4).pop();
  railLinks.forEach(link => {
    link.classList.toggle("active", !!current && link.getAttribute("href") === `#${current.id}`);
  });

  ticking = false;
}

addEventListener("scroll", () => {
  if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
}, { passive: true });
onScroll();

/* ---------- 3. pointer effects ---------- */
if (!reduced && matchMedia("(pointer:fine)").matches) {
  const glow = document.querySelector(".cursor-glow");
  addEventListener("pointermove", e => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  }, { passive: true });

  document.querySelectorAll(".tilt").forEach(el => {
    el.addEventListener("pointermove", e => {
      const box = el.getBoundingClientRect();
      const x = (e.clientX - box.left) / box.width - .5;
      const y = (e.clientY - box.top) / box.height - .5;
      el.style.transform = `perspective(1000px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg)`;
    });
    el.addEventListener("pointerleave", () => el.style.transform = "");
  });

  document.querySelectorAll(".magnetic").forEach(el => {
    el.addEventListener("pointermove", e => {
      const box = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - box.left - box.width / 2) * .16}px,${(e.clientY - box.top - box.height / 2) * .16}px)`;
    });
    el.addEventListener("pointerleave", () => el.style.transform = "");
  });
}

/* ---------- 4. scroll-in reveal ----------
   Everything except the headlines and body copy, which
   scroll-effects.js animates — so nothing runs twice. */
const reveals = document.querySelectorAll(
  ".stage-copy,.skin-scene,.label,.system-list>div,.projects-intro>span," +
  ".project-copy>p,.project-copy>a,.project-copy>.status,.visual," +
  ".experience>div>a,.nrc-experience a,.nrc-badge,.contact>div"
);

if (reduced || !("IntersectionObserver" in window)) {
  reveals.forEach(el => el.classList.add("reveal", "visible"));
} else {
  reveals.forEach(el => el.classList.add("reveal"));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .14 });
  reveals.forEach(el => observer.observe(el));
}

/* ---------- 5. 3D Minecraft skin viewer ---------- */
addEventListener("load", () => {
  const canvas = document.querySelector("#skin-viewer");
  if (!canvas || !window.skinview3d) return;
  try {
    const viewer = new skinview3d.SkinViewer({
      canvas,
      width: Math.max(300, canvas.clientWidth),
      height: Math.max(400, canvas.clientHeight),
      skin: "skin.png?v=20260727-5"
    });
    viewer.background = null;
    viewer.zoom = .82;
    viewer.fov = 45;
    viewer.autoRotate = !reduced;
    viewer.autoRotateSpeed = .4;
    viewer.controls.enablePan = false;
    viewer.globalLight.intensity = 2.1;
    viewer.cameraLight.intensity = .9;
    if (!reduced) {
      viewer.animation = new skinview3d.IdleAnimation();
      viewer.animation.speed = .65;
    }
    addEventListener("resize", () => {
      viewer.width = Math.max(300, canvas.clientWidth);
      viewer.height = Math.max(400, canvas.clientHeight);
    });
  } catch (e) {
    canvas.hidden = true;
  }
});
