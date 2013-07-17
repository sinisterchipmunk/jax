ENV['RAILS_ENV'] ||= 'test'

unless defined?(Rails) && Rails.respond_to?(:root)
  raise "Couldn't find Rails.root -- be sure to run specs via `rake`"
end

require ::Rails.root.join('config/environment')
require 'rspec/rails'

require 'jax'
require 'genspec'

Dir[File.expand_path("support/**/*.rb", File.dirname(__FILE__))].each do |fi|
  require fi
end

include FixturesHelper

RSpec.configure do |c|
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
