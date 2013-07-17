#define MAX_LIGHTS 1

shared uniform vec4 LightDiffuseColor;
shared uniform vec3 EyeSpaceLightDirection;
shared uniform vec3 EyeSpaceLightPosition;
shared uniform int LightType;
shared uniform float LightSpotInnerCos;
shared uniform float LightSpotOuterCos;
shared uniform vec4 LightSpecularColor;
