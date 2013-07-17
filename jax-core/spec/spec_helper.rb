require 'bundler/setup'
require 'jax/core'
require 'genspec'
require 'fileutils'

require 'rails/generators'
::Rails::Generators.options[:rails][:orm] = :active_record

class App < ::Rails::Application
	config.active_support.deprecation = :log
  config.assets.enabled = true
  config.assets.version = '1.0'
end

App.initialize!

RSpec.configure do |config|
	config.include Jax::Core::Matchers
end
