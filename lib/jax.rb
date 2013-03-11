# Fix for #74 - make Jax work on ruby 1.8.7
require 'active_support/core_ext/kernel/singleton_class'

require 'rails'
require 'jquery/rails'
require 'gl-matrix'
require 'jax/engine'

module Jax
  autoload :Commands,           "jax/commands"
  autoload :Configuration,      "jax/configuration"
  autoload :DirectiveProcessor, "jax/directive_processor"
  autoload :Generators,         "generators/jax/all"
  autoload :HelperMethods,      "jax/helper_methods"
  autoload :ResourceFile,       "jax/resource_file"
  autoload :Server,             "jax/server"
  autoload :Shader,             "jax/shader"
  autoload :Version,            "jax/version"
  autoload :VERSION,            "jax/version"
  autoload :Util,               "jax/util"
  
  module_function

  def config
    @config || reset_config!
  end
  
  def reset_config!
    @config = Jax::Configuration.new
  end
end
