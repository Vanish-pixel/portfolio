# Portfolio

My personal portfolio website, built with plain HTML, CSS and JavaScript.

**Live:** https://vanish-pixel.github.io/portfolio/

The page is hosted with GitHub Pages and includes an interactive 3D Minecraft skin in the hero section.

## Scroll animations

Headlines float in character by character, body copy sharpens word by word as you scroll past it. Both are vanilla ports of the React Bits components `ScrollFloat` and `ScrollReveal`, so the site stays framework-free — they live in `scroll-effects.js` / `scroll-effects.css` and drive GSAP + ScrollTrigger (loaded from a CDN).

Which elements get which effect is set at the bottom of `scroll-effects.js`. Without GSAP, or with "reduce motion" enabled in the operating system, the file does nothing and all text stays as it is.

## Minecraft skin

Put a normal 64×64 Minecraft Java skin in the project folder and name it:

```text
skin.png
```

The file needs to be in the same folder as `index.html`.

## Files

```text
index.html
style.css
script.js
scroll-effects.css
scroll-effects.js
skin.png
```

No build step is required. Push the files to the repository and GitHub Pages handles the rest.


## Header links

The left header link opens Discord. Replace `https://discord.com/` in `index.html` with your own Discord profile or server invite if needed.
