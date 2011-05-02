Jax.shaders['normal_map'] = new Jax.Shader({  common:"uniform sampler2D NormalMap;\n\nshared varying vec2 vTexCoords;\n",
  fragment:"void main(void) {\n  vec4 color = texture2D(NormalMap, vTexCoords);\n  import(FragColor, color *= FragColor);\n  gl_FragColor = color;\n}\n",
  vertex:"shared attribute vec4 VERTEX_POSITION;\nshared attribute vec2 VERTEX_TEXCOORDS;\n\nshared uniform mat4 mvMatrix, pMatrix;\n\nvoid main(void) {\n  gl_Position = pMatrix * mvMatrix * VERTEX_POSITION;\n  vTexCoords = VERTEX_TEXCOORDS;\n}\n",
exports: {},
name: "normal_map"});
