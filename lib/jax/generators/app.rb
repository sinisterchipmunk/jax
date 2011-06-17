# This file is required by bin/jax if script/jax isn't found.

require 'thor'
require 'thor/group'

module Jax
  module Generators
    autoload :App,        "jax/generators/app/app_generator"
  end
end

class JaxAppGenerator < Thor
  desc "new", "generates a new Jax application"
  def new(*args)
    Jax::Generators::App::AppGenerator.start(args)
  end
end
