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
