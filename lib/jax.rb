require "active_support/core_ext"
require "rails/railtie"
require File.expand_path("jax/core_ext/kernel", File.dirname(__FILE__))

# Don't raise an error when we extend Jax::Engine or Jax::Application
Rails::Railtie::ABSTRACT_RAILTIES << "Jax::Engine" << "Jax::Application"

JAX_FRAMEWORK_ROOT = File.expand_path('.', File.dirname(__FILE__)) unless defined?(JAX_FRAMEWORK_ROOT)

module Jax
  autoload :Engine,           "jax/engine"
  autoload :Generators,       "jax/generators/commands"
  autoload :VERSION,          "jax/version"
  autoload :Version,          "jax/version"
  autoload :Application,      "jax/application"
  autoload :Packager,         "jax/packager"
  autoload :ResourceCompiler, "jax/resource_compiler"
  autoload :Routes,           "jax/routes"
  autoload :Shader,           "jax/shader"
  autoload :Plugin,           "jax/plugin"
  
  class << self
    def application
      @application ||= nil
    end
    
    def application=(application)
      @application = application
    end
    
    def root
      application && application.root
    end
    
    def framework_root
      JAX_FRAMEWORK_ROOT
    end
    
    delegate :shader_load_paths, :javascript_load_paths, :plugin_repository_url, :default_plugin_repository_url,
             :plugin_repository_url=, :to => :application
  end
end

if defined?(APP_PATH) && Jax.application.nil?
  require APP_PATH
end
