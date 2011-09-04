require 'rails'
require 'jquery/rails'
require 'jax/engine'

module Jax
  autoload :Version, "jax/version"
  autoload :VERSION, "jax/version"
  autoload :Generators, "generators/jax/all"
  autoload :Commands, "jax/commands"
  autoload :ShaderProcessor, "jax/shader_processor"
  autoload :Shader, "jax/shader"
end
