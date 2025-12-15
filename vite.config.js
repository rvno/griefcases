import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    assetsDir: "",
    copyPublicDir: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Preserve public/ directory structure in dist/
          const fileName = assetInfo.names?.[0] || "";

          // Keep sounds in sounds/
          if (fileName.match(/\.(mp3|wav|ogg)$/)) {
            return "sounds/[name][extname]";
          }
          // Keep images in imgs/
          if (fileName.match(/\.(png|jpe?g|gif|webp|avif)$/)) {
            return "imgs/[name][extname]";
          }
          // Keep masks in masks/
          if (fileName.includes("mask") && fileName.match(/\.svg$/)) {
            return "masks/[name][extname]";
          }
          // Keep textures in textures/
          if (fileName.match(/\.(ktx2)$/)) {
            return "textures/[name][extname]";
          }

          return "[name]-[hash][extname]";
        },
      },
    },
  },
  publicDir: "public",
});
