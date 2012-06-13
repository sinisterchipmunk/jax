shared uniform int PASS;
shared uniform mat4 mMatrix, pMatrix;

uniform bool IsDualParaboloid;
uniform bool SHADOWMAP_ENABLED;
uniform sampler2D SHADOWMAP0, SHADOWMAP1;
uniform mat4 SHADOWMAP_MATRIX;
uniform bool SHADOWMAP_PCF_ENABLED;
uniform float DP_SHADOW_NEAR, DP_SHADOW_FAR;
uniform float SHADOWMAP_WIDTH, SHADOWMAP_HEIGHT;

varying vec4 vShadowCoord;
varying float vW;
varying vec4 vDP0, vDP1;
varying vec4 vVertPos;
