Jax.Helper = {
  instances: [],

  create: function(methods) {
    Jax.Helper.instances.push(methods);
    return methods;
  }
};
