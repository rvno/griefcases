import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);
  // gsap.registerPlugin(DrawSVGPlugin);

  // const scripts = document.querySelectorAll(".handwritten path");
  // scripts.forEach((script, index) => {
  //   gsap.fromTo(
  //     script,
  //     { drawSVG: 0 },
  //     {
  //       drawSVG: "100%",
  //       duration: 1.5,
  //       delay: index * 0.3,
  //       ease: "power2.inOut",
  //     }
  //   );
  // });

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  const stickySection = document.querySelector(".sticky");
  const slidesContainer = document.querySelector(".slides");
  const slider = document.querySelector(".slider");
  const slides = document.querySelectorAll(".slide");
  const revealImages = document.querySelectorAll(".masked-image");

  const stickyHeight = window.innerHeight * 6;
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
});
