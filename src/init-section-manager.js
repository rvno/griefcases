import { SectionManager } from "./section-manager.js";

document.addEventListener("DOMContentLoaded", () => {
  // Get all masked sections
  const sections = document.querySelectorAll(".masked-section[data-masked-section]");

  if (sections.length > 0) {
    // Initialize the SectionManager
    const sectionManager = new SectionManager(sections);

    console.log(`SectionManager initialized with ${sections.length} sections`);

    // Refresh ScrollTrigger after a short delay to ensure all elements are ready
    setTimeout(() => {
      sectionManager.refresh();
    }, 100);
  }
});
