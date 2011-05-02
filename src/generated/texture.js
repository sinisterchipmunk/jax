Jax.shaders['texture'] = new Jax.Shader({  common:"uniform sampler2D Texture;\n\nshared varying vec2 vTexCoords;\n",
  fragment:"void main(void) {\n  vec4 a = texture2D(Texture, vTexCoords);\n  vec4 d = a;\n  vec4 s, c;\n  \n  import(ambient, a *= ambient);\n  import(diffuse, d *= diffuse);\n  import(specular,s  = specular);\n  \n  c = a + d + s;\n  \n  export(vec4, FragColor, c);\n  gl_FragColor = c;\n}\n",
  vertex:"shared attribute vec4 VERTEX_POSITION;\nshared attribute vec2 VERTEX_TEXCOORDS;\n\nshared uniform mat4 mvMatrix, pMatrix;\n\nvoid main(void) {\n  gl_Position = pMatrix * mvMatrix * VERTEX_POSITION;\n  vTexCoords = VERTEX_TEXCOORDS;\n}\n",
exports: {"FragColor":"vec4"},
name: "texture"});
