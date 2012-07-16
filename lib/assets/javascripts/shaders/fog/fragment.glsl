void main() {
  /*
  I used to use gl_FragCoord.z / gl_FragCoord.w but noted that
  at least on my machine, it didn't interpolate cleanly; I don't
  know how best to define the issue but it seemed at first similar
  to a contrast or gamma issue. Switching to my own varying fixes
  the issue.
  */
  
  float fog;

  if (Algorithm == <%= Jax.LINEAR %>) {
    fog = smoothstep(Start, End, vDistance);
  } else if (Algorithm == <%= Jax.EXPONENTIAL %>) {
    fog = exp(-Density * vDistance);
    fog = 1.0 - clamp(fog, 0.0, 1.0);
  } else if (Algorithm == <%= Jax.EXP2 %>) {
    fog = exp2(-Density * Density * vDistance * vDistance * LOG2);
    fog = 1.0 - clamp(fog, 0.0, 1.0);
  }
  
  gl_FragColor.rgb = mix(gl_FragColor.rgb, FogColor.rgb, fog);
}
