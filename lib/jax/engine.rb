require 'rails/engine'

module Jax
  class Engine < ::Rails::Engine
    engine_name "jax"
    isolate_namespace Jax
    
    routes do
      root :to => "suite#index"
      match "/:action(/*id)", :controller => "suite"
    end
    
    config.after_initialize do |app|
      app.config.assets.paths.unshift File.join(app.root, "app/assets/jax/")
      
      app.assets.register_engine '.resource', Jax::ResourceFile
      
      app.assets.register_mime_type      "x-shader/x-webgl", 'glsl'
      app.assets.unregister_preprocessor 'application/javascript', Sprockets::DirectiveProcessor
      app.assets.register_preprocessor   'application/javascript', Jax::ShaderProcessor
      app.assets.register_preprocessor   'x-shader/x-webgl',       Jax::Shader
    end
        
    config.to_prepare do
      ::Rails.application.assets.each_file do |path|
        if path =~ /javascripts\/shaders\/.*\.ejs$/
          raise "Deprecated shader #{path}.\nTry renaming it to #{path.sub(/\.ejs$/, '.glsl')}."
        elsif path =~ /resources\/.*\.yml$/
          raise "Deprecated resource file #{path}.\nTry renaming it to #{path.sub(/\.yml$/, '.resource')}."
        end
      end unless @already_warned
      
      # only set @already_warned if no errors were raised, that way we ensure that
      # all files are iterated over
      @already_warned = true
    end
  end
end
