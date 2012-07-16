const float LOG2 = 1.442695;

uniform vec4 FogColor;
uniform int Algorithm;
uniform float Scale;
uniform float End;
uniform float Start;
uniform float Density;

varying float vDistance;

shared uniform mat4 ModelViewProjectionMatrix;
