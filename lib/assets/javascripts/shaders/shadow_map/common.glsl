//= require "shaders/lib/lights"

shared uniform int PASS;
shared uniform mat4 mMatrix, pMatrix;

shared uniform bool IsDualParaboloid[MAX_LIGHTS];
shared uniform bool SHADOWMAP_ENABLED[MAX_LIGHTS];
shared uniform sampler2D SHADOWMAP0[MAX_LIGHTS], SHADOWMAP1[MAX_LIGHTS];
shared uniform mat4 SHADOWMAP_MATRIX[MAX_LIGHTS];
shared uniform bool SHADOWMAP_PCF_ENABLED[MAX_LIGHTS];
shared uniform float DP_SHADOW_NEAR[MAX_LIGHTS], DP_SHADOW_FAR[MAX_LIGHTS];
shared uniform float SHADOWMAP_WIDTH[MAX_LIGHTS], SHADOWMAP_HEIGHT[MAX_LIGHTS];

shared varying vec4 vShadowCoord[MAX_LIGHTS];
