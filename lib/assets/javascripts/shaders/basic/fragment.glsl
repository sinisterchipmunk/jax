void main() {
  vec4 ambient = import(AMBIENT, vec4(1)),
       diffuse = import(DIFFUSE, vec4(1)),
       specular = import(SPECULAR, vec4(1));
     
  ambient = materialAmbient * vBaseColor;
  diffuse = materialDiffuse * vBaseColor;
  specular = materialSpecular * vBaseColor;
  
  gl_FragColor = ambient + diffuse + specular;

  export(vec4, AMBIENT, ambient);
  export(vec4, DIFFUSE, diffuse);
  export(vec4, SPECULAR, specular);
}
