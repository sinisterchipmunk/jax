require 'bundler/setup'
require 'jax'

require 'rspec'
require 'tmpdir'

# require 'rspec/isolation'

require 'genspec'

require 'fileutils'
Dir[File.expand_path("support/**/*.rb", File.dirname(__FILE__))].each { |fi| require fi }

require 'jax/rails/application'
Jax::Rails::Application.initialize!

# see support/test_model_generator.rb
::Rails::Generators.options[:rails][:orm] = "test"
