require 'rails'
require 'sprockets/railtie'
require 'gl-matrix'
require 'jax/core/directive_processor'
require 'jax/core/shader'
require 'jax/core/generators/all'
require 'jax/core/matchers'

module Jax
  module Core
    class Railtie < Rails::Engine
    	initializer 'jax.shaders' do |app|
      	app.assets.register_engine '.glsl', Jax::Core::Shader

	      app.assets.unregister_preprocessor 'application/javascript', Sprockets::DirectiveProcessor
	      app.assets.register_preprocessor   'application/javascript', Jax::Core::DirectiveProcessor
      end
    end
  end
end
