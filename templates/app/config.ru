# This file is loaded when you run `jax server` and
# is used to bootstrap the Jax environment using a
# built-in Ruby on Rails application.

require ::File.expand_path('../config/environment',  __FILE__)
run Jax::Rails::Application
