Jax.Material.Blob = (function() {
  return Jax.Class.create(Jax.Material, {
    initialize: function($super, options) {
      this.u = this.v = 0.0;
      
      options = Jax.Util.normalizeOptions(options, {
        shader: "blob"
      });

      $super(options);
    },
  
    setUniforms: function($super, context, mesh, options, uniforms) {
      $super(context, mesh, options, uniforms);

      uniforms.set('mvMatrix', context.getModelViewMatrix());
      uniforms.set('nMatrix',  context.getNormalMatrix());
      uniforms.set('pMatrix',  context.getProjectionMatrix());

      Jax.noise.bind(context, uniforms);
  
      uniforms.set('time', Jax.uptime);
    },

    setAttributes: function($super, context, mesh, options, attributes) {
      attributes.set('VERTEX_POSITION',  mesh.getVertexBuffer());
    }
  });
})();
