Jax.shaders['failsafe'] = new Jax.Shader({  fragment:"void main(void) {\n  gl_FragColor = vec4(1,0,0,1);\n}",
  vertex:"attribute vec4 VERTEX_POSITION;\n\nuniform mat4 mvMatrix, pMatrix;\n\nvoid main(void) {\n  gl_Position = mvMatrix * pMatrix * VERTEX_POSITION;\n}\n",
name: "failsafe"});
