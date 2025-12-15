/**
 * Updates all img src attributes in the HTML that reference public/ paths
 * to use absolute paths from root (Vite handles serving from public/ or dist/)
 */
export function updateImagePaths() {
  const images = document.querySelectorAll('img[src^="public/"]');

  images.forEach((img) => {
    const originalSrc = img.getAttribute("src");
    // Remove "public/" prefix and add leading slash
    const newSrc = originalSrc.replace(/^public\//, "/");
    img.src = newSrc;
  });

  console.log(`Updated ${images.length} image paths for current environment`);
}

// Auto-run on DOM content loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", updateImagePaths);
} else {
  // DOM is already loaded
  updateImagePaths();
}
