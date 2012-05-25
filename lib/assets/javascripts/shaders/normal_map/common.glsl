//= require "shaders/functions/lights"

uniform sampler2D NormalMap;

shared uniform mat4 mvMatrix, pMatrix, vMatrix;
shared uniform mat3 nMatrix;
shared uniform mat4 ivMatrix;
shared uniform mat3 vnMatrix;
shared uniform float materialShininess;
shared uniform int PASS_TYPE;

shared varying vec2 vTexCoords;

varying vec3 vEyeDir;
varying vec3 vLightDir;
varying float vAttenuation;
shared varying vec3 vNormal, vSurfacePos;
