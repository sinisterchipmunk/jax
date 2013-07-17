require 'rails'
require 'jquery/rails'
require 'jax/core'
require 'jasmine-rails'

module Jax
  class Engine < ::Rails::Engine
    engine_name "jax"
    isolate_namespace Jax
  end
end
