require 'bundler/setup'
require 'jax'

require 'rspec'
require 'tmpdir'

# require 'rspec/isolation'

require 'genspec'

require 'fileutils'
Dir[File.expand_path("support/**/*.rb", File.dirname(__FILE__))].each { |fi| require fi }

require 'jax/rails/application'
Jax::Rails::Application.config.assets.digest = false
# IMPORTANT: it is necessary to set this _prior_ to app initialization in order to pick up asset dirs
::Rails.application.config.root = File.expand_path("../../tmp/rails-specs", File.dirname(__FILE__))
Jax::Rails::Application.initialize!

# see support/test_model_generator.rb
::Rails::Generators.options[:rails][:orm] = "test"

require 'jax/testing/rails_environment'

RSpec.configure do |c|
  c.include Jax::Testing::RailsEnvironment
  c.before(:each) do
    setup_rails_environment
  end
end
