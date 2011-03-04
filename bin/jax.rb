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
end

require File.join(File.expand_path(File.dirname(__FILE__)), "../lib/jax/generators/commands")
JaxGenerator.start
