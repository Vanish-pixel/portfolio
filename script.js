const yearElement = document.getElementById("year");
yearElement.textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const revealElements = document.querySelectorAll(
  ".role-heading, .role-layout, .skills-strip, .projects-heading, .project, .skin-layout"
);

revealElements.forEach((element) => element.classList.add("reveal"));

if (prefersReducedMotion) {
  revealElements.forEach((element) => element.classList.add("visible"));
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
    { threshold: 0.1 }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function showSkinFallback(message) {
  const fallback = document.getElementById("skin-fallback");
  fallback.hidden = false;

  if (message) {
    const text = fallback.querySelector("span");
    text.innerHTML = message;
  }
}

function initSkinViewer() {
  const canvas = document.getElementById("skin-viewer");

  if (!window.skinview3d) {
    showSkinFallback(
      "The 3D viewer could not load. Check your internet connection and reload the page."
    );
    canvas.hidden = true;
    return;
  }

  const bounds = canvas.getBoundingClientRect();
  const width = Math.max(320, Math.round(bounds.width || 520));
  const height = Math.max(500, Math.round(bounds.height || 650));

  const viewer = new skinview3d.SkinViewer({
    canvas,
    width,
    height,
    skin: "skin.png"
  });

  viewer.background = null;
  viewer.zoom = 0.82;
  viewer.fov = 45;
  viewer.autoRotate = !prefersReducedMotion;
  viewer.autoRotateSpeed = 0.45;
  viewer.controls.enablePan = false;
  viewer.controls.minDistance = 25;
  viewer.controls.maxDistance = 85;
  viewer.globalLight.intensity = 2.4;
  viewer.cameraLight.intensity = 0.9;

  if (!prefersReducedMotion) {
    viewer.animation = new skinview3d.IdleAnimation();
    viewer.animation.speed = 0.75;
  }

  let resumeRotationTimer;

  const pauseAutoRotate = () => {
    viewer.autoRotate = false;
    window.clearTimeout(resumeRotationTimer);
  };

  const resumeAutoRotate = () => {
    if (prefersReducedMotion) {
      return;
    }

    window.clearTimeout(resumeRotationTimer);
    resumeRotationTimer = window.setTimeout(() => {
      viewer.autoRotate = true;
    }, 1800);
  };

  canvas.addEventListener("pointerdown", pauseAutoRotate);
  canvas.addEventListener("pointerup", resumeAutoRotate);
  canvas.addEventListener("pointercancel", resumeAutoRotate);
  canvas.addEventListener("wheel", resumeAutoRotate, { passive: true });

  const resizeViewer = () => {
    const newBounds = canvas.getBoundingClientRect();
    viewer.width = Math.max(280, Math.round(newBounds.width));
    viewer.height = Math.max(470, Math.round(newBounds.height));
  };

  window.addEventListener("resize", resizeViewer);

  fetch("skin.png", { method: "HEAD", cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        throw new Error("skin.png missing");
      }
    })
    .catch(() => {
      showSkinFallback(
        'Upload a 64×64 Minecraft skin to the repository and name it <code>skin.png</code>.'
      );
      canvas.style.opacity = "0.12";
    });
}

window.addEventListener("load", initSkinViewer);
