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
