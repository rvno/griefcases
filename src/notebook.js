import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);
  // gsap.registerPlugin(DrawSVGPlugin);

  // NOTE: Lenis is initialized in mask-reveal.js
  // We don't create a second instance to avoid scroll conflicts

  const stickySection = document.querySelector(".notebook");
  const slidesContainer = document.querySelector(".slides");
  const slider = document.querySelector(".slider");
  const slides = document.querySelectorAll(".slide");
  const revealImages = document.querySelectorAll(".masked-image");

  const stickyHeight = window.innerHeight * 10;
  const totalMove = slidesContainer.offsetWidth - slider.offsetWidth;
  const slideWidth = slider.offsetWidth;

  // Animate SVG drawing (initial state set in CSS to prevent flicker)
  // gsap.to(".handwritten path", {
  //   duration: 1.5,
  //   drawSVG: "100%",
  //   delay: 0.3,
  //   ease: "power2.inOut",
  // });

  // setup initial state of each slide
  slides.forEach((slide) => {
    const title = slide.querySelector(".title h1");
    gsap.set(title, { y: 15, opacity: 0 });
  });

  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio >= 1) {
          // reveal
          console.log(`reveal ${entry}`);
          entry.target.classList.add("masked-image--revealed");
        }
      });
    },
    { root: slider, threshold: [0, 0.5, 1] }
  );

  revealImages.forEach((image) => {
    imageObserver.observe(image);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // animate title in
        const title = entry.target.querySelector(".title h1");
        const svgSketches = entry.target.querySelectorAll(".handwritten");

        if (entry.intersectionRatio >= 0.25) {
          // title
          gsap.fromTo(
            title,
            { autoAlpha: 0, y: 15 },
            { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out" }
          );

          // svg sketches
          svgSketches.forEach((sketch) => {
            sketch.classList.add("written");
          });
        }
      });
    },
    {
      root: slider,
      // 25% in view
      threshold: [0, 0.25],
    }
  );

  slides.forEach((slide) => observer.observe(slide));

  // Check if notebook is wrapped in a masked-section
  const parentMaskedSection = stickySection.closest(".masked-section");

  if (parentMaskedSection) {
    // COORDINATED MODE: Mask reveal happens first, then horizontal scroll
    // The parent masked-section handles pinning (total duration: 10vh)
    // Mask reveal: 0-20% (2vh) - from mask-reveal.js config
    // Horizontal scroll: 20-100% (8vh) - starts after mask is fully revealed
    ScrollTrigger.create({
      trigger: parentMaskedSection,
      start: "top top",
      end: `+=${stickyHeight}px`,
      scrub: 1,
      pin: false, // Pinning is handled by mask-reveal.js on the parent
      pinSpacing: false,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress;

        // Horizontal scroll only animates after mask reveal is complete (after 20% progress)
        const maskRevealEnd = 0.2; // Must match maskEndProgress in mask-reveal.js

        if (progress > maskRevealEnd) {
          // Remap progress from [0.2, 1.0] to [0, 1] for smooth horizontal scroll
          const scrollProgress =
            (progress - maskRevealEnd) / (1 - maskRevealEnd);
          const mainMove = scrollProgress * totalMove;

          gsap.set(slidesContainer, {
            x: -mainMove,
          });
        } else {
          // Keep slides at starting position during mask reveal
          gsap.set(slidesContainer, {
            x: 0,
          });
        }
      },
    });
  } else {
    // STANDALONE MODE: Notebook handles its own pinning
    ScrollTrigger.create({
      trigger: stickySection,
      start: "top top",
      end: `+=${stickyHeight}px`,
      scrub: 1,
      pin: true,
      pinSpacing: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const mainMove = progress * totalMove;

        gsap.set(slidesContainer, {
          x: -mainMove,
        });
      },
    });
  }
});
