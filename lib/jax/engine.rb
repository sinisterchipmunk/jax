require 'rails'
require 'jasmine-rails'

module Jax
  class Engine < ::Rails::Engine
    engine_name "jax"
    isolate_namespace Jax

    initializer 'jax.engine' do |app|
      # exclude Jax assets in the gem directory, as these are used for general testing.
      # it wouldn't actually hurt anything if these were present, but best to avoid
      # confusion.
      # app.config.assets.paths.delete File.expand_path('../../app/assets/jax', File.dirname(__FILE__))
      
      # app.config.assets.paths.unshift File.join(app.root, "app/assets/jax")
      # app.config.assets.paths.unshift File.join(app.root, "lib/assets/jax")
      # app.config.assets.paths.unshift File.join(app.root, "vendor/assets/jax")

      app.assets.register_engine '.resource', Jax::ResourceFile
      app.assets.register_engine '.glsl',     Jax::Shader

      app.assets.unregister_preprocessor 'application/javascript', Sprockets::DirectiveProcessor
      app.assets.register_preprocessor   'application/javascript', Jax::DirectiveProcessor
    end

    config.to_prepare do
      ActionController::Base.helper Jax::HelperMethods
    end
    
    config.to_prepare do
      ::Rails.application.assets.each_file do |path|
        path = path.to_s
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
