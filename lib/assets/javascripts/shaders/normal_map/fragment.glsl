void main() {
  vec4 rgba = texture2D(Texture, vTexCoords *
                vec2(TextureScaleX, TextureScaleY));
  vec3 bump = normalize(rgba.xyz * 2.0 - 1.0);
  
  vec3 t = normalize(vT);
  vec3 n = normalize(vN);
  vec3 b = normalize(vB);
  
  // inverse
  // float r0 = t.x, r1 = b.x, r2 = n.x,
  //       r3 = t.y, r4 = b.y, r5 = n.y,
  //       r6 = t.z, r7 = b.z, r8 = b.z;
  
  float r0 = t.x, r1 = t.y, r2 = t.z,
        r3 = b.x, r4 = b.y, r5 = b.z,
        r6 = n.x, r7 = n.y, r8 = n.z;
  mat3 tangentMatrix = mat3(r0, r1, r2, r3, r4, r5, r6, r7, r8);
  
  bump = normalize(tangentMatrix * bump);
  // vertex normal is already encoded in the tangent matrix
  export(bool, UseVertexNormal, false);
  export(vec3, Normal, bump);
  
  // Alpha channel may contain a specular map
  float specular = 1.0;
  if (UseSpecularChannel) specular = rgba.a;
  export(float, SpecularIntensity, specular);
}
