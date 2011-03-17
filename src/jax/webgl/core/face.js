Jax.Core.Face = Jax.Class.create({
  initialize: function(vertexIndices) {
    if (arguments.length > 1)
      this.vertexIndices = vec3.create(arguments);
    else if (vertexIndices)
      this.vertexIndices = vec3.create(vertexIndices);
  }
});
