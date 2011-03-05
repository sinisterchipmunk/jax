#!/usr/bin/env ruby
require "rubygems"
require "thor"
require "thor/group"

class JaxGenerator < Thor
  desc "new", "generates a new JAX application"
  def new(*args)
    ARGV.shift # we've already processed the command
    Jax::Generators::App::AppGenerator.start
  end

  desc "generate", "generates a new controller or model"
  def generate(*args)
    ARGV.shift
    case ARGV.shift
      when 'controller' then Jax::Generators::Controller::ControllerGenerator.start
      else raise "not understood"
    end
  end
end

require File.join(File.expand_path(File.dirname(__FILE__)), "../lib/jax/generators/commands")
JaxGenerator.start
