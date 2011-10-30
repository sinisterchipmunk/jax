//= require "shaders/functions/lights"

uniform sampler2D NormalMap;

shared uniform mat4 mvMatrix, pMatrix, vMatrix;
shared uniform mat3 nMatrix;

shared varying vec2 vTexCoords;

varying vec3 vEyeDir;
varying vec3 vLightDir;
varying float vAttenuation;
