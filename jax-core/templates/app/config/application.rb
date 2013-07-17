require File.expand_path("boot", File.dirname(__FILE__))

require 'rails'

Bundler.require(:default, Rails.env) if defined?(Bundler)

require 'jax/rails/application'

# Hooks into Jax's built-in Rails application and sets
# the root directory. You can set any other Rails
# configuration options that you want here, too.

class Jax::Rails::Application < ::Rails::Application
  config.root = File.expand_path("..", File.dirname(__FILE__))
  config.assets.cache_store = [:file_store, File.expand_path("../tmp/cache/assets", File.dirname(__FILE__))]
end
