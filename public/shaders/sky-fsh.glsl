precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

vec4 rgb(float r, float g, float b) {
  return vec4(r/255.0, g/255.0, b/255.0, 1.0);
}
  
void main() {
  /* Center and normalize our screen coordinates between -0.5 and 0.5 with aspect ratio */
  // vec2 uv = (gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y;
  /* Normalize our screen coordinates between 0.0 and 1.0 */
  vec2 uv = gl_FragCoord.xy / u_resolution;
  
  float displacementX = 0.5 * sin(u_time);
  float displacementY = 0.25 * sin(u_time * 0.25);
  
  vec4 tl = rgb(186.0, 255.0, 255.0);
  vec4 tr = rgb(253.0, 223.0, 141.0);
  vec4 bl = rgb(250.0, 145.0, 90.0);
  vec4 br = rgb(132, 222.0, 255.0);
    
  vec4 color = mix(
      mix(tl, tr, uv.x + displacementX),
      mix(bl, br, uv.x - displacementX),
      uv.y + displacementY
  );

  gl_FragColor = color;
}