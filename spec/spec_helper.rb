ENV['RAILS_ENV'] ||= 'test'

unless defined? Rails
  # if Rails hasn't loaded, try to detect it and load the app corresponding
  # to the current version.
  require 'rails'
  ver = [Rails::VERSION::MAJOR, Rails::VERSION::MINOR].join('.')
  require File.expand_path("testbeds/rails-#{ver}/config/application",
          File.dirname(__FILE__))
end

# Can't figure out why this needs to be explicitly assigned.
require 'rails/generators'
::Rails::Generators.options[:rails][:orm] = :active_record

require File.expand_path('testbeds/_common', File.dirname(__FILE__))
require Rails.root.join('config/environment')
require 'rspec/rails'

require 'jax'
require 'genspec'

Dir[File.expand_path("support/**/*.rb", File.dirname(__FILE__))].each do |fi|
  require fi
end

include FixturesHelper

RSpec.configure do |c|
  c.include Jax::Testing::RailsEnvironment, :example_group => {
    :file_path => /spec\/generators/
  }
  c.include Jax::Testing::Matchers
  c.include FixturesHelper

  c.before do
    # necessary so jasmine can find assets relative to rails root, instead of
    # relative to `pwd`
    FileUtils.chdir Rails.root.to_s unless Rails.root.to_s.blank?
  end

  c.after do
    # necessary so rspec can find the next test file
    FileUtils.chdir File.expand_path('..', File.dirname(__FILE__))
  end

  c.before :type => :controller do
    @routes = Jax::Engine.routes
  end

  c.before :type => :routing do
    @routes = Jax::Engine.routes
  end
end
