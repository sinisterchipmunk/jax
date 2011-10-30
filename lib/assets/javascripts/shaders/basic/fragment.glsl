void main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {
  ambient = materialAmbient * vBaseColor;
  diffuse = materialDiffuse * vBaseColor;
  specular = materialSpecular * vBaseColor;
}
