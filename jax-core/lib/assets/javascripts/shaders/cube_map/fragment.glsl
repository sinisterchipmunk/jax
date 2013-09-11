void main(void) {
  gl_FragColor.rgb *= textureCube(CUBE_MAP, normalize(vCubeMapNormal)).rgb + texture2D(HAX, vec2(0.0, 0.0)).rgb * 0.0;
}
