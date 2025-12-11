
precision highp float;

in vec2 vUv;

uniform sampler2D tDiffuse;
uniform float time;
uniform float intensity;
uniform float dropoff;
uniform sampler2D lensDirt;

float inverseLerp(float v, float minValue, float maxValue) {
  return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(v, inMin, inMax);
  return mix(outMin, outMax, t);
}

float vignette(vec2 uvs) {
  float v1 = smoothstep(0.5, 0.3, abs(uvs.x - 0.5));
  float v2 = smoothstep(0.5, 0.3, abs(uvs.y - 0.5));
  float v = v1 * v2;
  v = pow(v, dropoff);
  v = remap(v, 0.0, 1.0, intensity, 1.0);
  return v;
}


void main() {
  vec2 uv = vUv;
  vec4 texel = texture(tDiffuse, uv);
  
  float darkening = vignette(uv);

  vec3 finalColour = texel.xyz * darkening;

  // Perform colour dodge using lens dirt texture
  // vec4 lensDirtSample = texture(lensDirt, uv);
  
  // Apply colour dodge
  // finalColour.xyz = COLOUR_DODGE(finalColour.xyz, lensDirtSample.xyz);
  // finalColour.xyz = mix(finalColour.xyz, COLOUR_SCREEN(finalColour.xyz, lensDirtSample.xyz), 0.02);
  // finalColour.xyz = COLOUR_SCREEN(finalColour.xyz, lensDirtSample.xyz, 0.1);

  pc_fragColor = vec4(finalColour, texel.w);
}