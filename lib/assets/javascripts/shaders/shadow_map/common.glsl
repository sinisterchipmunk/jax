shared uniform mat4 mMatrix;

uniform bool SHADOWMAP_ENABLED;
uniform sampler2D SHADOWMAP0, SHADOWMAP1;
uniform mat4 SHADOWMAP_MATRIX;
uniform bool SHADOWMAP_PCF_ENABLED;
uniform float DP_SHADOW_NEAR, DP_SHADOW_FAR;

varying vec4 vShadowCoord;

varying vec4 vDP0, vDP1;
//varying float vDPz, vDPDepth;

//= require "shaders/functions/lights"
