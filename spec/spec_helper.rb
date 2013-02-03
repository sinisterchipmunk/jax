require 'bundler/setup'

require 'rspec'
require 'tmpdir'

require 'genspec'
# workaround for testing due to a permissions bug in jruby
GenSpec.root = File.expand_path('../tmp/genspecs', File.dirname(__FILE__))
Dir[File.expand_path("support/**/*.rb", File.dirname(__FILE__))].each { |fi| require fi }

# see support/test_model_generator.rb
::Rails::Generators.options[:rails][:orm] = "test"

# Bypass rescue_action stuff in rails. This borrowed from rspec-rails.
class ActionController::Base
  def rescue_with_handler(exception)
    raise exception
  end
end

include FixturesHelper

RSpec.configure do |c|
  c.include Jax::Testing::RailsEnvironment
  c.include Jax::Testing::Matchers
  c.include Rack::Test::Methods, :example_group => { :file_path => Regexp.compile(/jax[\\\/]rails/) }
  c.include FixturesHelper
  
  c.before(:each) do
    FileUtils.rm_rf File.expand_path("../tmp/cache", File.dirname(__FILE__))
    FileUtils.rm_rf Rails.root.join('tmp/cache')
    setup_rails_environment
  end
end
