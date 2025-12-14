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
