require 'bundler/setup'
require 'jax'

require 'rspec'
require 'tmpdir'

require 'rspec/isolation'

Dir[File.expand_path("support/**/*.rb", File.dirname(__FILE__))].each { |fi| require fi }
