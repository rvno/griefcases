varying vec2 vUv;
uniform sampler2D depthTexture;

#include <packing>

void main() {
  float depth = texture(depthTexture, vUv).r;
  
  // gl_FragColor = vec4(1.0);
  // gl_FragColor = vec4(vec3(depth), 1.0);

  // takes the single floating point value from depth buffer and spltis it into 4 channels
  gl_FragColor = packDepthToRGBA(depth);
}