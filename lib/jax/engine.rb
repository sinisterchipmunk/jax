require 'rails/engine'

module Jax
  class Engine < ::Rails::Engine
    engine_name "jax"
    isolate_namespace Jax
    
    # see config/routes.rb. Why can't I do this here?
    # routes.draw do
    #   root :to => "suite#index"
    # end

    config.after_initialize do |app|
      app.assets.register_mime_type "x-shader/x-webgl", 'glsl'

      app.assets.unregister_preprocessor 'application/javascript', Sprockets::DirectiveProcessor
      app.assets.register_preprocessor   'application/javascript', Jax::ShaderProcessor
      app.assets.register_preprocessor   'x-shader/x-webgl',       Jax::Shader
    end
    
    config.to_prepare do
      ::Rails.application.assets.each_file do |path|
        @already_warned = true
        if path =~ /javascripts\/shaders\/.*\.ejs$/
          raise "Deprecated shader #{path}.\nTry renaming it to #{path.sub(/\.ejs$/, '.glsl')}."
        end
      end unless @already_warned
    end
  end
end
