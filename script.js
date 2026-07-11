// Footer year (the HTML contains a fallback year for no-JS visitors)
const yearElement = document.getElementById("year");
if (yearElement) yearElement.textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// ---------------------------------------------------------------
// Scroll reveal
// Falls back to "everything visible" when the user prefers
// reduced motion or the browser lacks IntersectionObserver.
// ---------------------------------------------------------------
const revealElements = document.querySelectorAll(
  ".section-heading, .skill-card, .experience-card, .project-card"
);

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("reveal", "visible"));
} else {
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
}

// ---------------------------------------------------------------
// 3D Minecraft skin viewer
// ---------------------------------------------------------------
function showSkinFallback() {
  const fallback = document.getElementById("skin-fallback");
  if (fallback) fallback.hidden = false;
}

function initSkinViewer() {
  const canvas = document.getElementById("skin-viewer");

  if (!canvas || !window.skinview3d) {
    showSkinFallback();
    if (canvas) canvas.hidden = true;
    return;
  }

  let viewer;

  // If WebGL is unavailable (old browser / blocked), show the
  // fallback instead of leaving a broken canvas behind.
  try {
    const bounds = canvas.getBoundingClientRect();

    viewer = new skinview3d.SkinViewer({
      canvas,
      width: Math.max(280, Math.round(bounds.width)),
      height: Math.max(480, Math.round(bounds.height)),
      skin: "skin.png"
    });
  } catch (error) {
    showSkinFallback();
    canvas.hidden = true;
    return;
  }

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

  // Throttle resizes to one update per frame
  let resizeScheduled = false;

  window.addEventListener("resize", () => {
    if (resizeScheduled) return;
    resizeScheduled = true;

    requestAnimationFrame(() => {
      resizeScheduled = false;
      const updatedBounds = canvas.getBoundingClientRect();
      viewer.width = Math.max(280, Math.round(updatedBounds.width));
      viewer.height = Math.max(460, Math.round(updatedBounds.height));
    });
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
