attribute float aSize;
attribute float aTimeMultiplier;

uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

float remap(float value, float originMin, float originMax, float destinationMin, float destinationMax)
{
    return destinationMin + (value - originMin) * (destinationMax - destinationMin) / (originMax - originMin);
}


void main() {

    float progress = uProgress * aTimeMultiplier;
    vec3 newPosition = position;

    // exploding
    float explodeProgress = remap(progress, 0.0, 0.1, 0.0, 1.0);
    explodeProgress = clamp(explodeProgress, 0.0, 1.0);
    explodeProgress = 1.0 - pow(1.0 - explodeProgress, 3.0); //Inverted so start fast an end slow
    newPosition *= explodeProgress;

    // falling
    float fallingProgress = remap(progress, 0.1, 1.0, 0.0, 1.0);
    fallingProgress = clamp(fallingProgress, 0.0, 1.0);
    fallingProgress = 1.0 - pow(1.0 - fallingProgress, 3.0);
    newPosition.y -= fallingProgress * 0.2;

    // scaling
    float sizeOpeningProgress = remap(progress, 0.0, 0.125, 0.0, 1.0);
    float sizeClosingProgress = remap(progress, 0.125, 1.0, 1.0, 0.0);
    float sizeProgress = min(sizeOpeningProgress, sizeClosingProgress);
    sizeProgress = clamp(sizeProgress, 0.0, 1.0);

    // Twinkle
    float twinkleProgress = remap(progress, 0.2, 0.8, 0.0, 1.0);
    twinkleProgress = clamp(twinkleProgress, 0.0, 1.0);
    float sizeTwinkle = sin(progress * 30.0) * 0.5 + 0.5;
    sizeTwinkle = 1.0 - sizeTwinkle * twinkleProgress;
    
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;

    gl_Position = projectionMatrix * viewPosition;

    gl_PointSize = uSize * uResolution.y * aSize * sizeProgress * sizeTwinkle;
    gl_PointSize *= 1.0 / - viewPosition.z; 

    if(gl_PointSize < 1.0)
        gl_Position = vec4(9999.9);
}