require 'rails'
require 'jasmine-rails'

# this appears to be necessary for rbx, jruby, ruby1.8 -- but it may be a bug in rails
# so possibly could be removed in later versions.
# Symptom: undefined method `singleton_class' for Jax:Module
require 'active_support/core_ext'

module Jax
  class Engine < ::Rails::Engine
    engine_name "jax"
    isolate_namespace Jax
    DEFAULT_JASMINE_YAML_LOCATION =
      Jasmine::Headless::Options::DEFAULT_OPTIONS[:jasmine_config]

    def self.determine_jasmine_yaml_location
      Jasmine::Headless::Options::DEFAULT_OPTIONS
      if File.file? DEFAULT_JASMINE_YAML_LOCATION
        Jasmine::Headless::Options::DEFAULT_OPTIONS[:jasmine_config] =
          DEFAULT_JASMINE_YAML_LOCATION
      else
        Jasmine::Headless::Options::DEFAULT_OPTIONS[:jasmine_config] =
          File.expand_path('../../spec/javascripts/support/jasmine.yml', File.dirname(__FILE__))
      end
    end

    routes do
      mount JasmineRails::Engine => '/jasmine', as: 'jasmine'
      root :to => "suite#index"
      match "/:action(/*id)", :controller => "suite"
    end
    
    config.before_configuration do
      Jax::Engine.determine_jasmine_yaml_location
      config.action_view.javascript_expansions[:jax] ||= [ 'jax' ]
    end

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
      Jax::Engine.determine_jasmine_yaml_location
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
