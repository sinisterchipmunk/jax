//= require "shaders/lib/lights.glsl"

shared uniform int PASS;
shared uniform float MaterialSpecularIntensity;
shared uniform float MaterialShininess;
shared uniform vec4 MaterialSpecularColor;
shared uniform mat4 ModelViewMatrix;
shared uniform mat3 NormalMatrix;

shared varying vec3 vEyeSpaceSurfaceNormal;
shared varying vec3 vEyeSpaceSurfacePosition;
