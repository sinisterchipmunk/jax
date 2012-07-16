# Deprecations for materials and shaders:
  * The custom material constructor now accepts an additional argument: `material`, which must be passed to
    `super`.
  * The custom material class now inherits from `Jax.Material.Layer` instead of extending `Jax.Material`
    directly.
  * The meaning of the `type` property for material resource files has changed:
    * `Custom`: the material is an arbitrary collection of Layers. It has no material properties
                except those which you explicitly define.
    * `Legacy`: the material is similar to a surface but supports only a low-level set of options
                such as specular and diffuse colors and specular, diffuse, and ambient intensity.
                It also supports an arbitrary collection of layers which can be added to it.
                This is the closest equivalent to your current materials and is the default if `type`
                is not found.
    * `Surface`: the material represents a flat surface and exposes high-level options for configuring it.
                Not yet implemented.
    * `Volume`: the material represents a volume such as a cloud or gas. Not yet implemented.
    * `Wire`: the material represents a wire frame that is otherwise similar to `Surface`. Not yet implemented.
    * `Halo`: the material will be rendered with a halo effect. Not yet implemented.
  * The `texture` method for material layers has been deprecated. Instead, you can set textures via the
    `set` method like you would set any other value; just pass the instance of `Jax.Texture` as the value.
    You can also explicitly set the texture index to be used in this way, but that's dangerous and not
    recommended.
