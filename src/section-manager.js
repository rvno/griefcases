import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * SectionManager
 * Manages section-based effects like theme changes when sections come into view
 */
export class SectionManager {
  #sections = [];
  #triggers = [];
  #noiseFilterTrigger = null;
  #activeSection = null;
  #onSectionChangeCallback = null;

  /**
   * @param {Array<HTMLElement>} sections - Array of section elements to manage
   */
  constructor(sections) {
    gsap.registerPlugin(ScrollTrigger);
    this.#sections = Array.from(sections);
    this.#init();
    this.#initNoiseFilter();
  }

  /**
   * Initialize ScrollTriggers for each section
   */
  #init() {
    this.#sections.forEach((section) => {
      const theme = this.#getThemeFromSection(section);

      if (theme) {
        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          onEnter: () => this.#changeTheme(theme),
          onEnterBack: () => this.#changeTheme(theme),
        });

        this.#triggers.push(trigger);
      }
    });
  }

  /**
   * Extract theme name from section classes
   * @param {HTMLElement} section - The section element
   * @returns {string|null} - Theme name (e.g., "eight", "g", "hourglass")
   */
  #getThemeFromSection(section) {
    const classList = Array.from(section.classList);

    // Look for masked-section--{theme} pattern
    const maskedSectionClass = classList.find((cls) =>
      cls.startsWith("masked-section--")
    );

    if (maskedSectionClass) {
      // Extract theme name: "masked-section--eight" -> "eight"
      return maskedSectionClass.replace("masked-section--", "");
    }

    // Look for mask-container--{theme} pattern (fallback)
    const maskContainer = section.querySelector('[class*="mask-container--"]');
    if (maskContainer) {
      const maskClass = Array.from(maskContainer.classList).find((cls) =>
        cls.startsWith("mask-container--")
      );
      if (maskClass) {
        return maskClass.replace("mask-container--", "");
      }
    }

    return null;
  }

  /**
   * Change the .bg element background color to the specified theme
   * @param {string} theme - Theme name (e.g., "eight", "g", "hourglass", "infinity")
   */
  #changeTheme(theme) {
    const themeVar = `var(--theme-${theme})`;
    const bgElement = document.querySelector(".bg");

    if (bgElement) {
      // Set background color (CSS transition will handle the animation)
      bgElement.style.backgroundColor = themeVar;

      console.log(`Theme changed to: ${theme}`);
    }

    // Update active section and notify callback
    if (this.#activeSection !== theme) {
      this.#activeSection = theme;
      if (this.#onSectionChangeCallback) {
        this.#onSectionChangeCallback(theme);
      }
    }
  }

  /**
   * Get the currently active section theme
   * @returns {string|null} - Active theme name (e.g., "eight", "g", "hourglass", "infinity")
   */
  getActiveSection() {
    return this.#activeSection;
  }

  /**
   * Register a callback to be notified when the active section changes
   * @param {Function} callback - Function to call with the new theme name
   */
  onSectionChange(callback) {
    this.#onSectionChangeCallback = callback;
  }

  /**
   * Initialize noise filter animation based on scroll progress
   */
  #initNoiseFilter() {
    // Get all section elements to calculate total scrollable height
    const allSections = document.querySelectorAll("section");
    if (allSections.length === 0) return;

    // Calculate the scroll distance: total scroll minus the last section height
    const lastSection = allSections[allSections.length - 1];
    const scrollHeight = document.documentElement.scrollHeight;
    const lastSectionHeight = lastSection ? lastSection.offsetHeight : 0;
    const endScroll = scrollHeight - lastSectionHeight - window.innerHeight;

    // Create ScrollTrigger to animate filter values on body scroll
    this.#noiseFilterTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: `+=${endScroll}px`,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress;

        // Interpolate filter values based on scroll progress
        // invert: 0 -> 1
        const invertValue = progress * 1;
        // brightness: 1 -> 3
        const brightnessValue = 1 + (progress * 2);

        // Apply filter to .noise::before using CSS custom properties
        document.documentElement.style.setProperty('--noise-invert', invertValue);
        document.documentElement.style.setProperty('--noise-brightness', brightnessValue);
      },
    });
  }

  /**
   * Destroy all ScrollTriggers
   */
  destroy() {
    this.#triggers.forEach((trigger) => trigger.kill());
    this.#triggers = [];

    if (this.#noiseFilterTrigger) {
      this.#noiseFilterTrigger.kill();
      this.#noiseFilterTrigger = null;
    }
  }

  /**
   * Refresh all ScrollTriggers
   */
  refresh() {
    ScrollTrigger.refresh();
  }
}
