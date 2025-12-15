import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  // Lenis setup (global, only once)
  const lenis = new Lenis({
    smooth: true,
    // Mobile touch settings
    touchMultiplier: 2,
    // Allow smooth scrolling on mobile
    smoothTouch: true,
    // Normalize wheel speed across browsers
    normalizeWheel: true,
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Make lenis globally accessible for debugging
  window.lenis = lenis;

  // Function to initialize a single masked section instance
  function initMask(maskedElement, options = {}) {
    // Calculate responsive maxMaskSize
    // At narrow viewports (< 876px), we need a larger percentage to prevent mask shape visibility
    const viewportWidth = window.innerWidth;
    let maxMaskSize = 1000;

    if (viewportWidth < 876) {
      // Scale up proportionally for narrow viewports
      // At 876px: 1000%, at 320px (mobile): ~2700%
      maxMaskSize = Math.max(1000, (876 / viewportWidth) * 1000);
    }

    const config = {
      pinDuration: window.innerHeight * 2,
      maskStartProgress: 0.25,
      maskEndProgress: 0.75,
      textStartProgress: 0.75,
      textEndProgress: 0.95,
      startY: 5,
      maxMaskSize: maxMaskSize,
      startScale: 1.5,
      endScale: 1,
      ...options,
    };

    const maskContainer = maskedElement.querySelector(".mask-container");

    ScrollTrigger.create({
      trigger: maskedElement,
      start: "top top",
      end: `+=${config.pinDuration}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onEnter: () => {
        // Activate mask-container when entering the section
        if (maskContainer) {
          maskContainer.classList.add("active");
        }
      },
      onLeaveBack: () => {
        // Deactivate mask-container when leaving backwards
        if (maskContainer) {
          maskContainer.classList.remove("active");
        }
      },
      onUpdate: (self) => {
        const progress = self.progress;

        // Mask reveal phase
        if (maskContainer) {
          if (
            progress >= config.maskStartProgress &&
            progress <= config.maskEndProgress
          ) {
            const maskProgress =
              (progress - config.maskStartProgress) /
              (config.maskEndProgress - config.maskStartProgress);
            const maskSize = `${maskProgress * config.maxMaskSize}%`;
            maskProgress * (config.startScale - config.endScale);

            maskContainer.style.setProperty("-webkit-mask-size", maskSize);
            maskContainer.style.setProperty("mask-size", maskSize);
          } else if (progress < config.maskStartProgress) {
            maskContainer.style.setProperty("-webkit-mask-size", "0%");
            maskContainer.style.setProperty("mask-size", "0%");
          } else if (progress > config.maskEndProgress) {
            maskContainer.style.setProperty(
              "-webkit-mask-size",
              `${config.maxMaskSize}%`
            );
            maskContainer.style.setProperty(
              "mask-size",
              `${config.maxMaskSize}%`
            );
          }
        }
      },
    });
  }

  // Initialize all masked section instances with specific configurations
  const maskedElements = document.querySelectorAll(
    ".masked-section[data-masked-section]"
  );
  maskedElements.forEach((element) => {
    // Check if this masked-section contains the notebook
    const hasNotebook = element.querySelector("#notebook");

    if (hasNotebook) {
      // NOTEBOOK CONFIGURATION
      // Calculate pin duration based on the actual width of the slides
      const slidesContainer = hasNotebook.querySelector(".slides");
      const slider = hasNotebook.querySelector(".slider");

      if (slidesContainer && slider) {
        const totalMove = slidesContainer.offsetWidth - slider.offsetWidth;
        const maskRevealFactor = 1.25; // 25% extra for mask reveal (matches notebook.js)
        const notebookPinDuration = totalMove * maskRevealFactor;

        initMask(element, {
          pinDuration: notebookPinDuration, // Total pin time matches notebook horizontal scroll
          maskStartProgress: 0.0, // Start mask reveal immediately (0% of total duration)
          maskEndProgress: 0.2, // Finish mask reveal at 20% (2vh out of 10vh)
          // This leaves 80% of the duration for the horizontal scroll to complete
        });
      } else {
        // Fallback if slides not found
        initMask(element);
      }
    } else {
      // DEFAULT CONFIGURATION for other masked sections
      initMask(element);
    }
  });

  // Handle window resize to refresh ScrollTrigger
  let resizeTimeout;
  window.addEventListener("resize", () => {
    // Debounce resize events to avoid performance issues
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);
  });
});
