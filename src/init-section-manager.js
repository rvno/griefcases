import { SectionManager } from "./section-manager.js";
import { AudioManager } from "./audio-manager.js";

document.addEventListener("DOMContentLoaded", () => {
  // Clear URL hash and scroll to top on page load
  if (window.location.hash) {
    history.replaceState(null, null, window.location.pathname + window.location.search);
  }
  window.scrollTo(0, 0);

  // Get all masked sections
  const sections = document.querySelectorAll(
    ".masked-section[data-masked-section]"
  );

  if (sections.length > 0) {
    // Initialize the SectionManager
    const sectionManager = new SectionManager(sections);

    // Initialize the AudioManager
    const audioManager = new AudioManager();

    // Pass section manager reference to audio manager
    audioManager.setSectionManager(sectionManager);

    // Connect audio manager to section changes
    sectionManager.onSectionChange((section) => {
      audioManager.onSectionChange(section);
    });

    // Make audioManager globally accessible for loader
    window.audioManager = audioManager;

    console.log(`SectionManager initialized with ${sections.length} sections`);

    // Refresh ScrollTrigger after a short delay to ensure all elements are ready
    setTimeout(() => {
      sectionManager.refresh();
    }, 100);
  }
});
