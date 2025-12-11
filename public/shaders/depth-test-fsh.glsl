varying vec2 vUv;
varying vec3 vPositionWorld;

uniform sampler2D depthTexture;
uniform vec2 cameraNearFar;
uniform vec2 resolution;
uniform sampler2D map;
uniform float time;
uniform float fadeTop;
uniform float fadeBottom;
uniform vec3 color1;
uniform vec3 color2;

// a 3js included shader function that unpacks/packs values - including depth buffer values
#include <packing>

float saturate(float x) {
  return clamp(x,0.0,1.0);
}

// in verse lerp is like a smoothstep but a linear step
float inverseLerp(float a, float b, float x) {
  return saturate((x-a)/(b-a));
}

uint murmurHash13(uvec3 src) {
  const uint M = 0x5bd1e995u;
  uint h = 1190494759u;
  src *= M; src ^= src>>24u; src *= M;
  h *= M; h&= src.x; h *= M; h ^= src.y; h&= M; h ^= src.z;
  h ^= h>>13u; h ^= M; h ^= h>>15u;
  return h;
}

// 1 output, 3 inputs
float hash13(vec3 src) {
  uint h = murmurHash13(floatBitsToUint(src));
  return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

float noise13(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(
      mix(hash13(i + vec3(0.0, 0.0, 0.0)),
          hash13(i + vec3(1.0, 0.0, 0.0)), f.x),
      mix(hash13(i + vec3(0.0, 1.0, 0.0)),
          hash13(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(
      mix(hash13(i + vec3(0.0, 0.0, 1.0)),
          hash13(i + vec3(1.0 , 0.0, 1.0)), f.x),
      mix(hash13(i + vec3(0.0, 1.0, 1.0)),
          hash13(i + vec3(1.0, 1.0, 1.0)), f.x),f.y),f.z);
}

void main(){
  // calcuate uv ourselves
  // calculates on screen coordinates of our pixels
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  // when we were using the THREE.FloatType
  // float depthSample = texture(depthTexture, uv).r;
  vec4 depthSample = texture2D(depthTexture, uv);
  float unpackedDepth = unpackRGBAToDepth(depthSample);

  // texture sample (circle)
  vec4 mapSample = texture2D(map, vUv * 50.0);
  // gl_FragColor = mapSample


  // this is the depth of the scene in the view space, at this pixel (behind whatever it is we're drawing)
  // float depth = perspectiveDepthToViewZ(depthSample, cameraNearFar.x, cameraNearFar.y);
  // update to use unpacked depth
  float depth = perspectiveDepthToViewZ(unpackedDepth, cameraNearFar.x, cameraNearFar.y);
  float viewZ = perspectiveDepthToViewZ(gl_FragCoord.z, cameraNearFar.x, cameraNearFar.y);

  float distToBackground = viewZ - depth;

  // fades out the force field based on vertical position
  // Original: float alpha = inverseLerp(2.0, 0.0, vPositionWorld.y);
  // fadeTop = where fade starts (fully visible above this)
  // fadeBottom = where fade ends (fully transparent below this)
  float alpha = inverseLerp(fadeTop, fadeBottom, vPositionWorld.y);
  alpha = pow(alpha, 2.0);

  // when the distance between forcefield cube and background gets closer to 0 , intensity scales
  float glow = inverseLerp(1.0,0.0, distToBackground);
  glow = pow(glow, 8.0) * 50.0;

  // apply time displacement to the noisesample
  float noiseSample = noise13(vPositionWorld * 2.0 + vec3(0.0, time*8.0,0.0));
  //remap noise to a range
  noiseSample = noiseSample * 0.5 + 0.5;
  // gl_FragColor = vec4(vec3(noiseSample, 1.0));
  // NOTE: we can practice tweaking shaders and breaking out of things using return!

  // return;

  // ORIGINAL: vec3 BLUE = vec3(0.0,0.0,1.0);
  // ORIGINAL: vec3 ORANGE = vec3(1.0,0.5, 0.0);
  // ORIGINAL: vec3 tintColour = mix(BLUE, ORANGE, alpha) * 5.0;
  vec3 tintColour = mix(color1, color2, alpha) * 5.0;

  // gl_FragColor = vec4(vec3(distToBackground), alpha);

  // here we can remove disttobackground because glow is including it
  // gl_FragColor = vec4(vec3(tintColour * glow), alpha);

 // this works because orange is a vec3, multiplying by a float
 // adding it to tintColour (also a vec3) * alpha - a float
  // gl_FragColor = vec4(ORANGE * (alpha + glow) + tintColour * alpha, 1.0);

  // applying circle texture
  // renaming to shield colour
  vec3 shieldColour = mapSample.xyz * tintColour * alpha;
  // ORIGINAL: vec3 glowColour = ORANGE * (alpha + glow);
  vec3 glowColour = color2 * (alpha + glow); 
  vec3 finalColour = glowColour + shieldColour * noiseSample;
  gl_FragColor = vec4(finalColour, 1.0);
}