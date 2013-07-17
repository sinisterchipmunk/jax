//= require 'shader-script'

// ShaderScript isn't production ready yet and shouldn't be sent to
// client code. So this file is here to ensure SS is loaded only
// in Jax development, and not in development of projects that
// depend on Jax.
//
// Otherwise, this file would live in `helpers/shaderscript_helper.js`.
