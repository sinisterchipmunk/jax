//= require "shaders/functions/lights"

shared uniform bool LIGHTING_ENABLED;
shared uniform mat4 ivMatrix, mvMatrix;
shared uniform mat3 vnMatrix, nMatrix;
shared uniform float materialShininess;

shared varying vec3 vLightDir;
shared varying vec3 vNormal, vSurfacePos;
