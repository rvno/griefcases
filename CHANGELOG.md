# CHANGELOG

## 12-06-25

- setup repo
- port mha section with tweaks
- static loader w/ noise animation

## 12-07-25

- Created image mask component with dual-layer masking system

  - Component consists of two layers: an overlay image and a masked background
  - Overlay layer (`.image-mask__overlay`) displays at full opacity with the mask PNG (Nala-test.png)
  - Masked background layer (`.image-mask__masked-bg`) uses CSS `mask-image` to clip content through the mask shape
  - Applied `mix-blend-mode: screen` at 20% opacity on masked layer for subtle brightening effect
  - Both layers scaled to 98% with crisp rendering optimizations (`image-rendering: crisp-edges`, `translateZ(0)`)
  - Layers anchored to bottom of slide container using `object-position: center bottom`
  - Set `pointer-events: none` on both layers to allow click-through to underlying content (iframes, videos)
  - Wildcard selector ensures all children of masked-bg fill 100% width/height
  - Result: Layered masking effect where overlay provides shape definition while masked layer adds blended visual interest

## 12-09-24

- Setup threejs scene
- basic light, stats, tweakpane, and box mesh

## 12-10-24

- setup 3rd person camera
- input manager
- readded html elements
- added custom models

## 12-11-24

- Implemented dynamic forcefield shader controls

  - **Fade System**: Changed from hardcoded fade values to dimension-based calculation. Fade now occurs only in the top 25% of the forcefield height, calculated from geometry bounding box and scale (main.js:249-266). When scale changes via Tweakpane, `fadeTop` and `fadeBottom` uniforms automatically recalculate to maintain the 25% fade region.

  - **Color Uniforms**: Replaced hardcoded `BLUE` and `ORANGE` shader constants with `color1` and `color2` uniforms (depth-test-fsh.glsl:11-12, 101, 116). JavaScript initializes these as `THREE.Vector3` values (main.js:232-233) and Tweakpane color pickers update them in real-time (main.js:295-311).

  - **Tweakpane Integration**: Added "Forcefield" folder with scale slider (0.1-10.0) and two color pickers, allowing real-time adjustment of all visual properties while maintaining proper fade behavior at any scale.

- Critical performance optimizations
  - **Optimized Bloom Pass**: Reduced bloom mipmap levels from 4 to 3 (bloomPass.js:204), cutting render passes from 10 to 7 per frame. Removed redundant copy-to-writeBuffer pass (bloomPass.js:343-345), reducing bloom overhead by ~2-3ms per frame. (Per Claude)

## 12-12-24

- Refactored forcefield system for reusability and multi-instance support

  - **Material Instancing**: Created base forcefield material (`#forceFieldBaseMaterial_`) that is cloned for each model instance. Each clone maintains independent fade values while sharing depth and pattern textures. Color uniforms are updated across all instances via Tweakpane callbacks (main.js:359-381).

  - **Texture Integration**: Replaced solid colors with KTX2 texture pattern (`placeholder-paw.ktx2`) applied to forcefield shader (main.js:326). Texture is shared across all forcefield instances to minimize memory usage.

  - **Reusable Forcefield Factory**: Abstracted forcefield creation into `#createForceFieldForModel_()` method that automatically generates properly-sized and positioned forcefields for any model/object. Function calculates world-space bounding box via `Box3.setFromObject()` to account for model transforms and scale.

  - **Bounding Box-Based Positioning**: Fixed positioning issue for scaled models by using bounding box center instead of model pivot point. Critical for models with non-centered pivots (e.g., turtle model at scale 0.37) - ensures forcefield encapsulates visible geometry regardless of local transforms or pivot placement. Fade calculations also use bounding box center for accurate vertical alignment.

  - **Shared Texture References**: After cloning ShaderMaterial, depth texture and pattern texture are explicitly re-assigned since `clone()`creates new uniform objects rather than preserving texture references.

## 12-13-24

- noise and background adjustments
- set scrolltrigger to handle updating background-color blend based on active section
- tie scroll progress to invert and brightness filters

## 12-15-24

### Asset Path Management System

Implemented unified asset path management system using Vite's built-in public directory handling:

- **Created `vite.config.js`** - Configured Vite build settings:
  - Set `base: "./"` for relative paths in production
  - Set `publicDir: "public"` to specify static assets source
  - Set `copyPublicDir: true` to copy public/ contents to dist/
  - Configured `assetFileNames` to preserve directory structure (sounds/, imgs/, masks/, textures/)

- **Created `src/utils/asset-path.js`** - Helper function that:
  - Strips `public/` prefix from paths
  - Returns absolute paths from root (`/sounds/...`, `/imgs/...`)
  - Works seamlessly in both dev (serves from `public/`) and prod (serves from `dist/`)

- **Created `src/update-html-paths.js`** - Runtime script that:
  - Converts HTML `<img>` tags from `public/` to `/` paths
  - Auto-runs on DOM load to update all image references

- **Updated CSS paths** - Changed all `url("public/...)` to `url("/...")` in base.css:
  - Background images, mask images, and SVG masks now use absolute paths
  - Vite handles correct resolution in both environments

- **Updated JavaScript asset loading**:
  - `src/audio-manager.js` - Audio tracks use `getAssetPath()` helper
  - `src/loader.js` - All 474 Nala image paths use `getAssetPath()`
  - `src/main.js` - Texture loading uses `getAssetPath()`

- **Key Benefits**:
  - Same paths work in dev (`npm run dev`) and prod (`npm run build`)
  - No environment-specific conditionals needed
  - Automatic asset copying to dist/ during build
  - Preserved directory structure for organized assets

### Development Tools Conditional Loading

Implemented environment-based conditional loading for development tools to keep production builds clean:

- **Modified `src/app.js`** - Base App class now checks `import.meta.env.DEV`:
  - Stats.js panel only initialized in development mode
  - Tweakpane only created in development mode
  - Post-processing effect controls wrapped in dev-mode checks
  - `#raf_()` method conditionally updates stats only when available

- **Modified `src/main.js`** - All Tweakpane controls wrapped in `if (this.Pane)` checks:
  - Sunlight controls (color, intensity)
  - Forcefield controls (color1, color2)
  - Character controls (wireframe, opacity, position, rotFactor)
  - Environment controls (fog color/density, HDR texture, background settings)
  - Model binding debug controls

- **Modified `src/third-person-camera.js`** - Camera debug controls conditional:
  - Camera folder only created when pane is available
  - Lerp factor, offset, and look-at bindings wrapped in dev check

- **Benefits**:
  - Cleaner production UI (no debug panels)
  - Smaller bundle size (Tweakpane and Stats not included in prod)
  - Better performance (no debug overhead in production)
  - Same codebase for both environments
  - Full debug tools available during development

### Character Orbital Items System

Implemented orbital animation system for character items with visibility controls:

- **Created `#characterItems_` Array** - Stores 4 cylinder meshes that orbit the character:
  - Each item has: mesh, distance, angle, baseY, oscillationSpeed, oscillationAmount, orbitSpeed, visible, name
  - Items positioned at corners of a square formation around character
  - Scaled down to 35% of original size (65% reduction)

- **Orbital Motion** (`#updateCharacterItems_` method):
  - Calculates circular motion in XZ plane using `Math.cos/sin(angle * orbitSpeed)`
  - Each item maintains constant distance while rotating around character
  - Independent orbit speeds (0.5 base) with varying oscillation rates (0.8-1.3)

- **Vertical Oscillation**:
  - Sine wave pattern for up/down movement: `Math.sin(time * speed) * amount`
  - Different oscillation amounts (0.25-0.35) create varied visual rhythm
  - Base Y positions offset (0.25, 0.55) for depth variation

- **Visibility System**:
  - Added Tweakpane folder "Character Items" with toggle for each item
  - `visible` property controls both mesh visibility and position updates
  - Early return in update function prevents calculations for hidden items

### Boundary Detection System

Implemented character movement constraints based on floor dimensions:

- **Added Private Fields**:
  - `#floor_` - Reference to ground mesh for dimension calculations
  - `#boundaryThreshold_` - Configurable distance from edge (default: 1.5 units)

- **Movement Clamping** (`#updateCharacterMovement_` method):
  - Calculates new position before applying to character
  - Gets floor dimensions from PlaneGeometry parameters (20x20)
  - Boundary limits: `(floor_dimension / 2) - boundaryThreshold`
  - Uses `THREE.MathUtils.clamp()` to constrain X/Z within boundaries
  - Creates "inner fence" preventing character from approaching edge

- **Tweakpane Integration**:
  - Added "Boundary Threshold" slider (0-10, step 0.1) to Character folder
  - Real-time updates via onChange handler
  - Public getter `BoundaryThreshold` for external access

- **Result**: Character constrained to 17x17 area on 20x20 floor (with default 1.5 threshold)

### Boundary Turtle Placement

Created 8 turtle instances positioned around boundary perimeter as visual markers:

- **Turtle Positioning System**:
  - Load single turtle model, clone for 8 instances (memory efficient)
  - Calculate boundary coordinates: `boundaryX/Z = (floorSize / 2) - threshold`
  - 4 corner positions: NE, NW, SW, SE at diagonal coordinates (±8.5, ±8.5)
  - 4 edge midpoints: North, South, East, West at (0 or ±8.5, ±8.5 or 0)

- **Inward Rotation Logic** (main.js:169-175):
  - Calculate direction vector from turtle position to center: `direction = (0 - pos.x, 0 - pos.z)`
  - Y-axis rotation uses `Math.atan2(directionX, directionZ)` - note parameter order
  - **Critical**: Three.js Y-axis rotation requires `atan2(x, z)` NOT `atan2(z, x)`
  - Each turtle faces center regardless of position (corners face diagonally, edges face perpendicular)

- **Forcefield Integration**:
  - Each turtle gets forcefield via `#createForceFieldForModel_()`
  - Forcefields positioned using bounding box centers (handles non-centered pivots)
  - All 8 turtles stored in `#objects_` array with descriptive names

- **Tweakpane Controls**:
  - Individual folders for each turtle (`turtle_0` through `turtle_7`)
  - Position, rotation, and scale controls per instance
  - Rotation values include calculated `angleToCenter` for accurate orientation
