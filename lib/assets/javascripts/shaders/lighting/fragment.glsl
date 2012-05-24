void main() {
  vec4 ambient = import(AMBIENT, vec4(1)),
       diffuse = import(DIFFUSE, vec4(1)),
       specular = import(SPECULAR, vec4(1));
       
  vec4 _ambient = vec4(0,0,0,0), _diffuse = vec4(0,0,0,0), _specular = vec4(0,0,0,0);
  vec3 nNormal = normalize(vNormal);

  if (LIGHTING_ENABLED) {
    if (LIGHT_TYPE == <%=Jax.DIRECTIONAL_LIGHT%>)
      DirectionalLight(nNormal, _ambient, _diffuse, _specular);
    else
      if (LIGHT_TYPE == <%=Jax.POINT_LIGHT%>)
        if (LIGHT_ATTENUATION_CONSTANT == 1.0 && LIGHT_ATTENUATION_LINEAR == 0.0 && LIGHT_ATTENUATION_QUADRATIC == 0.0)
          PointLightWithoutAttenuation(vSurfacePos, nNormal, _ambient, _diffuse, _specular);
        else
          PointLightWithAttenuation(vSurfacePos, nNormal, _ambient, _diffuse, _specular);
      else
        if (LIGHT_TYPE == <%=Jax.SPOT_LIGHT%>)
          SpotLight(vSurfacePos, nNormal, _ambient, _diffuse, _specular);
        else
        { // error condition, output 100% red
          _ambient = _diffuse = _specular = vec4(1,0,0,1);
        }
  } else {
    _ambient = vec4(1,1,1,1);
    _diffuse = _specular = vec4(0,0,0,0);
  }

  /*
    Light colors will be multiplied by material colors. Light can't really be transparent,
    so we'll use alpha to represent intensity. This means we must multiply resultant light
    colors by light alpha, and then hard-code alpha 1 to avoid polluting transparency.
    
    The reason we use LIGHT_*.a instead of _*.a is because _*.a has been tainted by attenuation.
    A light's intensity, regardless of distance or relative brightness, has not actually changed;
    attenuation has been factored into color already; we don't want to square the atten amt.
  */
  ambient *= vec4(_ambient.rgb * LIGHT_AMBIENT.a, 1.0);
  diffuse *= vec4(_diffuse.rgb * LIGHT_DIFFUSE.a, 1.0);
  specular *= vec4(_specular.rgb * LIGHT_SPECULAR.a, 1.0);

  gl_FragColor = ambient + diffuse + specular;

  export(vec4, AMBIENT, ambient);
  export(vec4, DIFFUSE, diffuse);
  export(vec4, SPECULAR, specular);
}
