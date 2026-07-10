document.getElementById("year").textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const elements = document.querySelectorAll(".section-title, .project");

elements.forEach((element) => element.classList.add("reveal"));

if (prefersReducedMotion) {
  elements.forEach((element) => element.classList.add("visible"));
} else {
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

  elements.forEach((element) => observer.observe(element));
}

function showSkinFallback() {
  const fallback = document.getElementById("skin-fallback");
  fallback.hidden = false;
}

function initSkinViewer() {
  const canvas = document.getElementById("skin-viewer");

  if (!window.skinview3d) {
    showSkinFallback();
    canvas.hidden = true;
    return;
  }

  const bounds = canvas.getBoundingClientRect();

  const viewer = new skinview3d.SkinViewer({
    canvas,
    width: Math.max(300, Math.round(bounds.width)),
    height: Math.max(500, Math.round(bounds.height)),
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
  viewer.cameraLight.intensity = 0.8;

  if (!prefersReducedMotion) {
    viewer.animation = new skinview3d.IdleAnimation();
    viewer.animation.speed = 0.7;
  }

  let resumeTimer;

  function pauseRotation() {
    viewer.autoRotate = false;
    window.clearTimeout(resumeTimer);
  }

  function resumeRotation() {
    if (prefersReducedMotion) {
      return;
    }

    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => {
      viewer.autoRotate = true;
    }, 1500);
  }

  canvas.addEventListener("pointerdown", pauseRotation);
  canvas.addEventListener("pointerup", resumeRotation);
  canvas.addEventListener("pointercancel", resumeRotation);
  canvas.addEventListener("wheel", resumeRotation, { passive: true });

  function resizeViewer() {
    const updatedBounds = canvas.getBoundingClientRect();
    viewer.width = Math.max(280, Math.round(updatedBounds.width));
    viewer.height = Math.max(480, Math.round(updatedBounds.height));
  }

  window.addEventListener("resize", resizeViewer);

  fetch("skin.png", { method: "HEAD", cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        throw new Error("skin.png missing");
      }
    })
    .catch(() => {
      showSkinFallback();
      canvas.style.opacity = "0.15";
    });
}

window.addEventListener("load", initSkinViewer);
