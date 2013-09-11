/*
  HACK that makes cube textures magically work on my machine.
  This may be a driver bug. If so, we can remove the hack when the driver
  becomes fixed, blacklisted or obsolete.

  Symptom: If the first texture to be bound is a TEXTURE_CUBE_MAP,
  Invalid Operation errors start popping up all over. If the first bound
  texture is a TEXTURE_2D, everything works just fine.
 
  NOTE: There is some performance cost to this hack, because in order to
  prevent the GLSL compiler from simply removing unused samplers we have
  to actually sample the `HAX` texture in the shader. So, it behooves us
  to remove the hack as soon as possible.
*/
uniform sampler2D HAX;
uniform samplerCube CUBE_MAP;

uniform mat3 CNORMAL_MATRIX;

varying vec3 vCubeMapNormal;
