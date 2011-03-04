#!/usr/bin/env ruby
require "rubygems"
require "thor/group"

case ARGV.shift
  when nil
    puts "Perhaps you should try specifying a command?"
    puts
  when 'new'
    require File.join(File.expand_path(File.dirname(__FILE__)), "../generators/jax/app_generator")
    Jax::AppGenerator.start
  else
    puts "Invalid command."
    puts
end
