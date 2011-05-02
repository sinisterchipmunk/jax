Jax.shaders['color_only'] = new Jax.Shader({  common:"shared varying vec4 vColor;\n",
  fragment:"void main(void) {\n  gl_FragColor = vColor;\n}\n",
  vertex:"shared attribute vec4 VERTEX_POSITION, VERTEX_COLOR;\n\nshared uniform mat4 mvMatrix, pMatrix;\n\nvoid main(void) {\n  gl_Position = pMatrix * mvMatrix * VERTEX_POSITION;\n  vColor = VERTEX_COLOR;\n}\n",
exports: {},
name: "color_only"});
