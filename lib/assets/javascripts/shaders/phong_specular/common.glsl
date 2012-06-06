shared uniform int PASS;
shared uniform float MaterialSpecularIntensity;
shared uniform float MaterialShininess;
shared uniform vec4 MaterialSpecularColor;
shared uniform vec4 LightSpecularColor;
shared uniform vec3 EyeSpaceLightDirection;
shared uniform vec3 EyeSpaceLightPosition;
shared uniform mat4 ModelViewMatrix;
shared uniform mat3 NormalMatrix;
shared uniform int LightType;
shared uniform vec3 LightPosition;
shared uniform float LightSpotInnerCos;
shared uniform float LightSpotOuterCos;
shared uniform float LightSpotExponent;

shared varying vec3 vEyeSpaceSurfaceNormal;
shared varying vec3 vEyeSpaceSurfacePosition;
