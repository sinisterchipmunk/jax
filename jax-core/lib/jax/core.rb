require 'rails'
require 'sprockets/railtie'
require 'jquery/rails'
require 'gl-matrix'
require 'jax/core/shader_processor'
require 'jax/core/generators/all'
require 'jax/core/matchers'

module Jax
  module Core
    class Railtie < Rails::Engine
    	initializer 'jax.shaders' do |app|
        app.assets.register_engine '.glsl',    Jax::Core::ShaderProcessor
      end
    end
  end
end
