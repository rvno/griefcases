/**
 * Get the correct asset path based on environment
 * Vite serves files from public/ in dev and copies them to dist/ in production
 * Both use the same path structure from root
 */
export function getAssetPath(path) {
  // Remove leading slash or public/ prefix if present
  const cleanPath = path.replace(/^\/?(public\/)?/, "");

  // Return absolute path from root - Vite handles the rest
  return `/${cleanPath}`;
}
