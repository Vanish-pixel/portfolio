document.getElementById("year").textContent = new Date().getFullYear();

const elements = document.querySelectorAll(".section-title, .project");

elements.forEach((element) => element.classList.add("reveal"));

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
