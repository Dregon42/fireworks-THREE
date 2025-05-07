uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform vec2 uFrequency;
uniform float uTime;
uniform float uMaxHeight;

attribute vec3 position;
attribute vec2 uv;
// attribute float aRandom;

// varying float vRandom;
varying vec2 vUv;
varying float vElevation;

void main() {

    
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float elevation = sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
    elevation += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;

    modelPosition.z += elevation;

    // raise flag
    float riseAmount = uTime * 0.1;
    riseAmount = min(riseAmount, uMaxHeight);
    modelPosition.y += riseAmount;

    // modelPosition.z += sin(modelPosition.x * uFrequency.x - uTime) * 0.05; //wave animation
    // modelPosition.z += sin(modelPosition.y * uFrequency.y - uTime) * 0.015; //wave animation
    
    // modelPosition.z += aRandom * 0.1;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    // vRandom = aRandom;
    vUv = uv;
    vElevation = elevation;
}