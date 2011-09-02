require 'rails/engine'

module Jax
  class Engine < ::Rails::Engine
    engine_name "jax"
    isolate_namespace Jax

    # see config/routes.rb. Why can't I do this here?
    # routes.draw do
    #   root :to => "suite#index"
    # end
  end
end
