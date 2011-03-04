#!/usr/bin/env ruby
require "rubygems"
require "thor/group"
require File.join(File.expand_path(File.dirname(__FILE__)), "../lib/jax/generators/commands")

if which = Jax::COMMANDS[ARGV.shift]
  Jax.const_get(which).start
else
  puts "Available commands:"
  puts
  puts Jax::COMMANDS.keys
end
