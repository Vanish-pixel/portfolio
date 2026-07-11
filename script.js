document.getElementById("year").textContent = new Date().getFullYear();

const revealElements = document.querySelectorAll(
  ".section-heading, .skill-card, .experience-card, .project-card"
);

revealElements.forEach((element) => element.classList.add("reveal"));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealElements.forEach((element) => observer.observe(element));


const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

function showSkinFallback() {
  document.getElementById("skin-fallback").hidden = false;
}

function initSkinViewer() {
  const canvas = document.getElementById("skin-viewer");

  if (!canvas || !window.skinview3d) {
    showSkinFallback();
    if (canvas) canvas.hidden = true;
    return;
  }

  const bounds = canvas.getBoundingClientRect();

  const viewer = new skinview3d.SkinViewer({
    canvas,
    width: Math.max(280, Math.round(bounds.width)),
    height: Math.max(480, Math.round(bounds.height)),
    skin: "skin.png"
  });

  viewer.background = null;
  viewer.zoom = 0.8;
  viewer.fov = 45;
  viewer.autoRotate = !prefersReducedMotion;
  viewer.autoRotateSpeed = 0.45;
  viewer.controls.enablePan = false;
  viewer.controls.minDistance = 25;
  viewer.controls.maxDistance = 85;
  viewer.globalLight.intensity = 2.2;
  viewer.cameraLight.intensity = 0.9;

  if (!prefersReducedMotion) {
    viewer.animation = new skinview3d.IdleAnimation();
    viewer.animation.speed = 0.7;
  }

  let resumeTimer;

  const pauseRotation = () => {
    viewer.autoRotate = false;
    clearTimeout(resumeTimer);
  };

  const resumeRotation = () => {
    if (prefersReducedMotion) return;

    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      viewer.autoRotate = true;
    }, 1500);
  };

  canvas.addEventListener("pointerdown", pauseRotation);
  canvas.addEventListener("pointerup", resumeRotation);
  canvas.addEventListener("pointercancel", resumeRotation);
  canvas.addEventListener("wheel", resumeRotation, { passive: true });

  window.addEventListener("resize", () => {
    const updatedBounds = canvas.getBoundingClientRect();
    viewer.width = Math.max(280, Math.round(updatedBounds.width));
    viewer.height = Math.max(460, Math.round(updatedBounds.height));
  });

  fetch("skin.png", { method: "HEAD", cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("skin.png missing");
    })
    .catch(() => {
      showSkinFallback();
      canvas.style.opacity = "0.15";
    });
}

window.addEventListener("load", initSkinViewer);
