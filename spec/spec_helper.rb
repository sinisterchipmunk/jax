require 'bundler/setup'
require 'jax'

require 'rspec'
require 'tmpdir'

Dir[File.expand_path("support/**/*.rb", File.dirname(__FILE__))].each { |fi| require fi }

# This straight from rspec-rails. Question: why was it not exposed?
def escaped_path(*parts)
  Regexp.compile(parts.join('[\\\/]'))
end

RSpec.configure do |c|
  # specs with type :rails or living in ./spec/rails/ are meant to be run within a Rails application.
  c.include RailsApplicationHelper, :type => :rails, :example_group => {
    :file_path => escaped_path(%w[spec rails])
  }
end
