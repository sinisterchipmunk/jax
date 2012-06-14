//= require "shaders/lib/lights"

shared uniform int PASS;
shared uniform mat4 mMatrix, pMatrix;

shared uniform bool IsDualParaboloid[1];
shared uniform bool SHADOWMAP_ENABLED[1];
shared uniform sampler2D SHADOWMAP0[1], SHADOWMAP1[1];
shared uniform mat4 SHADOWMAP_MATRIX[1];
shared uniform bool SHADOWMAP_PCF_ENABLED[1];
shared uniform float DP_SHADOW_NEAR[1], DP_SHADOW_FAR[1];
shared uniform float SHADOWMAP_WIDTH[1], SHADOWMAP_HEIGHT[1];

shared varying vec4 vShadowCoord[1];
