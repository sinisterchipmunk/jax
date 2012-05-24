# Deprecations for materials and shaders:
  * The custom material constructor now accepts an additional argument: `material`, which must be passed to
    `super`.
  * The custom material class now inherits from `Jax.Material.Layer` instead of extending `Jax.Material`
    directly.
  * The meaning of the `type` property for material resource files has changed:
    * `Custom`: the material is an arbitrary collection of Layers. This is equivalent to your current
      materials and is the default if `type` is not found.
    * `Surface`: the material represents a flat surface. Not yet implemented.
    * `Volume`: the material represents a volume such as a cloud or gas. Not yet implemented.
    * `Wire`: the material represents a wire frame that is otherwise similar to `Surface`. Not yet implemented.
    * `Halo`: the material will be rendered with a halo effect. Not yet implemented.
