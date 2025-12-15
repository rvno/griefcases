document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".section-nav__item");
  const sections = document.querySelectorAll(
    ".masked-section[data-masked-section]"
  );

  console.log("Section nav initialized", navItems.length, "items found");

  // Update active state based on hash
  function updateActiveNav() {
    const hash = window.location.hash.replace("#", "");

    navItems.forEach((item) => {
      const section = item.dataset.section;
      if (section === hash) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  // Handle hash changes
  window.addEventListener("hashchange", updateActiveNav);

  // Initial update
  updateActiveNav();

  // Smooth scroll to section on click
  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      console.log("Nav item clicked:", item.dataset.section);
      e.preventDefault();
      // e.stopPropagation();

      const section = item.dataset.section;
      const targetElement = document.getElementById(section);

      console.log("Target element:", targetElement);

      if (targetElement && window.lenis) {
        // Update hash without triggering scroll
        history.pushState(null, null, `#${section}`);
        updateActiveNav();

        // Smooth scroll with Lenis
        window.lenis.scrollTo(targetElement, {
          offset: 0,
          duration: 1.5,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else if (!window.lenis) {
        console.error("Lenis not found");
      }
    });
  });
});
