/* ============================================================
   SCROLL EFFECTS — ScrollFloat + ScrollReveal
   ------------------------------------------------------------
   Vanilla port of the two React Bits components, so the site
   keeps its no-build / no-framework setup. Animation values
   (easing, trigger points, stagger, blur) match the originals.

   Differences to the React versions, on purpose:
     - They attach to headings/paragraphs that already exist in
       index.html instead of rendering their own <h2>, so the
       site typography stays untouched.
     - Text is split into words first, characters second. The
       original wraps every space in a non-breaking span, which
       stops long headings from wrapping on narrow screens.
     - No ScrollTrigger.killAll() cleanup: nothing unmounts here.

   Requires gsap + ScrollTrigger to be loaded before this file.
   ============================================================ */
(function () {
  "use strict";

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // No GSAP (CDN blocked / offline) or reduced motion => leave the
  // markup completely alone. Nothing is hidden by CSS, so the text
  // simply stays readable.
  if (reduced || !window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  /* --------------------------------------------------------
     Splitting helpers — walk the real DOM so inline markup
     (<em>, <br>) inside a heading survives the split.
     -------------------------------------------------------- */
  function splitTextNodes(node, makeParts) {
    Array.from(node.childNodes).forEach(child => {
      if (child.nodeType === 3) {
        const parts = makeParts(child.nodeValue);
        if (parts.length) child.replaceWith(...parts);
      } else if (child.nodeType === 1 && child.tagName !== "BR") {
        splitTextNodes(child, makeParts);
      }
    });
  }

  // "Two words" -> [span.char-word[span.char × 3], " ", span.char-word[…]]
  function toChars(text) {
    return text.split(/(\s+)/).filter(Boolean).map(part => {
      if (/^\s+$/.test(part)) return document.createTextNode(part);
      const word = document.createElement("span");
      word.className = "char-word";
      Array.from(part).forEach(ch => {
        const char = document.createElement("span");
        char.className = "char";
        char.textContent = ch;
        word.appendChild(char);
      });
      return word;
    });
  }

  // "Two words" -> [span.word, " ", span.word]
  function toWords(text) {
    return text.split(/(\s+)/).filter(Boolean).map(part => {
      if (/^\s+$/.test(part)) return document.createTextNode(part);
      const word = document.createElement("span");
      word.className = "word";
      word.textContent = part;
      return word;
    });
  }

  // Keeps the element readable for screen readers: the split spans
  // are hidden and the original sentence is exposed as a label.
  // innerText is used so a <br> still reads as a break, not as a
  // missing space ("thinking.Human").
  function label(el) {
    const text = (el.innerText || el.textContent).replace(/\s+/g, " ").trim();
    el.setAttribute("aria-label", text);
  }

  function wrapChildren(el, className) {
    const wrap = document.createElement("span");
    wrap.className = className;
    wrap.setAttribute("aria-hidden", "true");
    while (el.firstChild) wrap.appendChild(el.firstChild);
    el.appendChild(wrap);
    return wrap;
  }

  /* --------------------------------------------------------
     ScrollFloat — characters float up into place on scrub
     -------------------------------------------------------- */
  function scrollFloat(el, options) {
    if (!el) return;
    const o = Object.assign({
      animationDuration: 1,
      ease: "back.inOut(2)",
      scrollStart: "center bottom+=50%",
      scrollEnd: "bottom bottom-=40%",
      stagger: 0.03
    }, options);

    label(el);
    el.classList.add("scroll-float");
    const inner = wrapChildren(el, "scroll-float-text");
    splitTextNodes(inner, toChars);

    gsap.fromTo(inner.querySelectorAll(".char"), {
      willChange: "opacity, transform",
      opacity: 0,
      yPercent: 120,
      scaleY: 2.3,
      scaleX: 0.7,
      transformOrigin: "50% 0%"
    }, {
      duration: o.animationDuration,
      ease: o.ease,
      opacity: 1,
      yPercent: 0,
      scaleY: 1,
      scaleX: 1,
      stagger: o.stagger,
      scrollTrigger: { trigger: el, start: o.scrollStart, end: o.scrollEnd, scrub: true }
    });
  }

  /* --------------------------------------------------------
     ScrollReveal — words sharpen and brighten word by word,
     while the block straightens out of a slight rotation
     -------------------------------------------------------- */
  function scrollReveal(el, options) {
    if (!el) return;
    const o = Object.assign({
      enableBlur: true,
      baseOpacity: 0.1,
      baseRotation: 3,
      blurStrength: 4,
      rotationEnd: "bottom bottom",
      wordAnimationEnd: "bottom bottom"
    }, options);

    label(el);
    el.classList.add("scroll-reveal");
    const inner = wrapChildren(el, "scroll-reveal-text");
    splitTextNodes(inner, toWords);
    const words = inner.querySelectorAll(".word");

    if (o.baseRotation) {
      gsap.fromTo(el,
        { transformOrigin: "0% 50%", rotate: o.baseRotation },
        {
          ease: "none",
          rotate: 0,
          scrollTrigger: { trigger: el, start: "top bottom", end: o.rotationEnd, scrub: true }
        }
      );
    }

    gsap.fromTo(words,
      { opacity: o.baseOpacity, willChange: "opacity" },
      {
        ease: "none",
        opacity: 1,
        stagger: 0.05,
        scrollTrigger: { trigger: el, start: "top bottom-=20%", end: o.wordAnimationEnd, scrub: true }
      }
    );

    if (o.enableBlur) {
      gsap.fromTo(words,
        { filter: `blur(${o.blurStrength}px)` },
        {
          ease: "none",
          filter: "blur(0px)",
          stagger: 0.05,
          scrollTrigger: { trigger: el, start: "top bottom-=20%", end: o.wordAnimationEnd, scrub: true }
        }
      );
    }
  }

  /* --------------------------------------------------------
     Where the effects are used on this page
     -------------------------------------------------------- */
  const each = (selector, fn) => document.querySelectorAll(selector).forEach(fn);

  // Section headlines — the big statements.
  each(".profile-title h2, .projects-intro h2, .contact h2", el => scrollFloat(el));

  // Project titles — a touch slower per character, they are shorter.
  each(".project-copy h3", el => scrollFloat(el, { stagger: 0.04 }));

  // Experience headlines — smaller type, so a tighter stagger.
  each(".experience h2", el => scrollFloat(el, { stagger: 0.025 }));

  // Body copy — reads in as you scroll past it.
  scrollReveal(document.querySelector(".bio"), { baseRotation: 3, baseOpacity: 0.12, blurStrength: 6 });
  each(".project-copy > span", el => scrollReveal(el, { baseRotation: 0, baseOpacity: 0.15, blurStrength: 5 }));
  // Only the description right after each experience headline — a
  // descendant selector would also catch the .char spans created above.
  each(".experience h2 + span", el =>
    scrollReveal(el, { baseRotation: 0, baseOpacity: 0.15, blurStrength: 5 }));

  // Fonts and the 3D skin canvas change layout height after first
  // paint, so the trigger positions need one recalculation.
  addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
})();
