shared uniform int PASS;
shared uniform float MaterialAmbientIntensity, MaterialDiffuseIntensity, MaterialSpecularIntensity;
shared uniform float MaterialShininess;
shared uniform vec4 MaterialDiffuseColor, MaterialSpecularColor;
shared uniform vec4 WorldAmbientColor;
shared uniform vec4 LightDiffuseColor, LightSpecularColor;
shared uniform vec3 EyeSpaceLightDirection;
shared uniform vec3 EyeSpaceLightPosition;

shared varying vec3 vEyeSpaceSurfaceNormal;
shared varying vec3 vEyeSpaceSurfacePosition;
