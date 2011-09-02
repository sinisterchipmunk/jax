require 'rails/commands/server'

module Jax
  # The server is just a bare-bones Rails application built into the Jax gem.
  # It mounts Jax::Engine at the root path.
  #
  # The server can be run from any non-Rails Jax application by simply executing
  # the `jax server` command.
  #
  # Note: in a Rails app, you should simply mount Jax::Engine directly in your
  # `config/routes.rb` file:
  #
  #   Rails.application.routes.draw do
  #     mount Jax::Engine => "/jax" if Rails.env != "production"
  #   end
  #
  # The above example will mount the Jax development suite in development and
  # test modes, but not in production mode. Usually, you won't want to expose Jax
  # to a production environment, but of course this is up to you.
  #
  # Note that you only need to mount Jax::Engine if you want to use the development
  # suite. You get the Jax assets (e.g. the Jax JavaScript API) for free when you
  # add Jax to your Gemfile.
  #
  # TODO make `jax server` runnable from Rails apps.
  #
  class Server < ::Rails::Server
  end
end
