//= require "shaders/functions/lights"

shared uniform mat4 mMatrix;

shared uniform mat4 ivMatrix, mvMatrix, pMatrix;
shared uniform mat3 vnMatrix, nMatrix;
shared uniform float materialShininess;
shared uniform int PASS_TYPE;

uniform bool SHADOWMAP_ENABLED;
uniform sampler2D SHADOWMAP0, SHADOWMAP1;
uniform mat4 SHADOWMAP_MATRIX;
uniform bool SHADOWMAP_PCF_ENABLED;
uniform float DP_SHADOW_NEAR, DP_SHADOW_FAR;

varying vec4 vShadowCoord;

varying vec4 vDP0, vDP1;
//varying float vDPz, vDPDepth;

