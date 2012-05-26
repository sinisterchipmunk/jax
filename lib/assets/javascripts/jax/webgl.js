//= require "jax/vendor/gl-matrix"
//= require "jax/webgl/core/gl_enums"
//= require_self
//= require "jax/webgl/camera"
//= require "jax/webgl/world"
//= require "jax/webgl/texture"

Jax.getGlobal()['WEBGL_CONTEXT_NAME'] = "experimental-webgl";
Jax.getGlobal()['WEBGL_CONTEXT_OPTIONS'] = {stencil:true};
