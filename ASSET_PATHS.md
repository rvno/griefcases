# Asset Path Configuration

This project uses Vite's built-in public directory handling to manage asset paths across development and production environments.

## How It Works

### Development (`npm run dev`)
- Assets in `public/` are served from `/` by Vite's dev server
- Example: `public/sounds/song.mp3` → accessible at `/sounds/song.mp3`

### Production (`npm run build`)
- Vite copies everything from `public/` to `dist/` during build
- Assets maintain the same path structure
- Example: `public/sounds/song.mp3` → copied to `dist/sounds/song.mp3` → accessible at `/sounds/song.mp3`

## Usage

### In JavaScript/TypeScript
Use the `getAssetPath()` helper function:

```javascript
import { getAssetPath } from "./utils/asset-path.js";

// Audio files
const audioPath = getAssetPath("sounds/my-audio.mp3");
// Returns: "/sounds/my-audio.mp3"

// Images
const imagePath = getAssetPath("imgs/photo.jpg");
// Returns: "/imgs/photo.jpg"
```

### In CSS
Use absolute paths from root:

```css
.my-element {
  background-image: url("/imgs/background.jpg");
  mask-image: url("/masks/shape.svg");
}
```

### In HTML
Use absolute paths or the update script will convert them:

```html
<!-- Option 1: Use absolute paths directly -->
<img src="/imgs/photo.jpg" />

<!-- Option 2: Use public/ prefix (auto-converted by update-html-paths.js) -->
<img src="public/imgs/photo.jpg" />
```

## File Structure

```
griefcases/
├── public/                 # Static assets (not processed by Vite bundler)
│   ├── sounds/            # Audio files
│   ├── imgs/              # Images
│   ├── masks/             # SVG masks
│   └── textures/          # Texture files
├── src/
│   ├── utils/
│   │   └── asset-path.js  # Helper for asset path resolution
│   └── update-html-paths.js # Converts HTML img src attributes
└── dist/                  # Production build output (created on build)
    ├── sounds/            # Copied from public/sounds/
    ├── imgs/              # Copied from public/imgs/
    ├── masks/             # Copied from public/masks/
    └── textures/          # Copied from public/textures/
```

## Configuration Files

### vite.config.js
- Sets `base: "./"` for relative paths in production
- Sets `publicDir: "public"` to specify source for static assets
- Configures `copyPublicDir: true` to copy public/ contents to dist/
- Preserves directory structure in production build

## Key Points

1. **Always use absolute paths from root** (`/sounds/...` not `public/sounds/...`)
2. **The `getAssetPath()` helper** automatically strips `public/` prefix
3. **Vite handles everything automatically** - same paths work in dev and prod
4. **No manual path switching needed** - Vite serves from `public/` in dev and `dist/` in prod
