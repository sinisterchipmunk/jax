#define MAX_LIGHTS 1

shared uniform vec4 LightDiffuseColor[MAX_LIGHTS];
shared uniform vec3 EyeSpaceLightDirection[MAX_LIGHTS];
shared uniform vec3 EyeSpaceLightPosition[MAX_LIGHTS];
shared uniform int LightType[MAX_LIGHTS];
shared uniform vec3 LightPosition[MAX_LIGHTS];
shared uniform float LightSpotInnerCos[MAX_LIGHTS];
shared uniform float LightSpotOuterCos[MAX_LIGHTS];
shared uniform float LightSpotExponent[MAX_LIGHTS];
shared uniform vec4 LightSpecularColor[MAX_LIGHTS];
