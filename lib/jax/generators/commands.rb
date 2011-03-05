# This script is required by script/jax if script/jax is found.

require 'thor'
require 'thor/group'

module Jax
  module Generators
    autoload :Controller, File.join(File.dirname(__FILE__), "controller/controller_generator")
    autoload :Model,      File.join(File.dirname(__FILE__), "model/model_generator")
  end
end

class JaxGeneratorInvoker < Thor
  def self.basename
    "jax generate"
  end

  desc "controller", "generates a new JAX controller"
  def controller(*args)
    Jax::Generators::Controller::ControllerGenerator.start(args)
  end
  
  desc "model", "generates a new JAX model"
  def model(*args)
    Jax::Generators::Model::ModelGenerator.start(args)
  end
end

class JaxGenerator < Thor
  desc "generate", "generates a new controller or model"
  def generate(*args)
    JaxGeneratorInvoker.start(args)
  end
end
