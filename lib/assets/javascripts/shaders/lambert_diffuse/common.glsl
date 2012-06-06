shared uniform int PASS;
shared uniform float MaterialDiffuseIntensity;
shared uniform vec4 MaterialDiffuseColor;
shared uniform vec4 LightDiffuseColor;
shared uniform vec3 EyeSpaceLightDirection;
shared uniform vec3 EyeSpaceLightPosition;
shared uniform mat3 NormalMatrix;
shared uniform mat4 ModelViewMatrix;
shared uniform int LightType;
shared uniform vec3 LightPosition;
shared uniform float LightSpotInnerCos;
shared uniform float LightSpotOuterCos;
shared uniform float LightSpotExponent;

shared varying vec3 vEyeSpaceSurfaceNormal;
