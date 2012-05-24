void main() {
  vec4 ambient = import(AMBIENT, vec4(1)),
       diffuse = import(DIFFUSE, vec4(1)),
       specular = import(SPECULAR, vec4(1));
       
  vec4 t = texture2D(Texture, vTexCoords * vec2(TextureScaleX, TextureScaleY));

  ambient  *= t;
  diffuse  *= t;
  specular *= t;
 
  ambient.a  *= t.a;
  diffuse.a  *= t.a;
  specular.a *= t.a;
  
  gl_FragColor = ambient + diffuse + specular;

  export(vec4, AMBIENT, ambient);
  export(vec4, DIFFUSE, diffuse);
  export(vec4, SPECULAR, specular);
}
