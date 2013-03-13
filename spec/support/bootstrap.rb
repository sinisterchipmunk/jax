require 'fileutils'
require 'jax'
require 'jax/rails/application'
require 'jax/testing/rails_environment'
require 'jax/testing/rspec_matchers'
require 'shader-script'

class Bootstrap
  include Jax::Testing::RailsEnvironment

  def initialize
    Jax::Rails::Application.config.assets.digest = false
    # IMPORTANT: it is necessary to set this _prior_ to app initialization in order to pick up asset dirs
    ::Rails.application.config.root = File.expand_path("../../tmp/rails-specs", File.dirname(__FILE__))
    Jax::Rails::Application.config.assets.paths << File.expand_path('../../spec/javascripts', File.dirname(__FILE__))
    Jax::Rails::Application.config.paths['public'] = File.expand_path("../fixtures/public", File.dirname(__FILE__))
    Jax::Rails::Application.initialize!

    FileUtils.rm_rf File.expand_path("../../tmp/cache", File.dirname(__FILE__))
    FileUtils.rm_rf Rails.root.join('tmp/cache')
    setup_rails_environment
  end
end

Bootstrap.new
