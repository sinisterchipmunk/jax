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

# Bypass rescue_action stuff in rails. This borrowed from rspec-rails.
class ActionController::Base
  def rescue_with_handler(exception)
    raise exception
  end
end

include FixturesHelper

require 'fakeweb'
FakeWeb.allow_net_connect = false
FakeWeb.register_uri(:get, "http://nowhere.example.com/plugins/search/cloud", :response => fixture('web/plugins/404.http'))
FakeWeb.register_uri(:get, "http://plugins.jaxgl.com/plugins", :response => fixture('web/plugins/all.xml'))
FakeWeb.register_uri(:get, "http://plugins.jaxgl.com/plugins/search/missing", :response => fixture('web/plugins/none.http'))
FakeWeb.register_uri(:get, "http://plugins.jaxgl.com/plugins/search/cloud", :response => fixture('web/plugins/clouds.xml'))
FakeWeb.register_uri(:get, "http://plugins.jaxgl.com/plugins/search/clouds", :response => fixture('web/plugins/clouds.xml'))
FakeWeb.register_uri(:get, "http://plugins.jaxgl.com/plugins/search/vertex-blob", :response => fixture('web/plugins/vertex-blob.xml'))
FakeWeb.register_uri(:get, "http://plugins.jaxgl.com/plugins/search/vertex-height-map", :response => fixture('web/plugins/vertex-height-map.xml'))
FakeWeb.register_uri(:get, "http://plugins.jaxgl.com/plugins/search/vert", :response => fixture('web/plugins/vert.xml'))
FakeWeb.register_uri(:get, "http://plugins.jaxgl.com/plugins/clouds.tgz?version=1.0.2", :response => fixture('web/plugins/example.tgz.http'))
FakeWeb.register_uri(:get, "http://plugins.jaxgl.com/plugins/clouds.tgz?version=1.0.0", :response => fixture('web/plugins/example.tgz.http'))
FakeWeb.register_uri(:get, "http://plugins.jaxgl.com/plugins/vertex-blob.tgz?version=1.0.0", :response => fixture('web/plugins/example.tgz.http'))
FakeWeb.register_uri(:get, "http://plugins.jaxgl.com/plugins/vertex-height-map.tgz?version=1.0.1", :response => fixture('web/plugins/example.tgz.http'))
FakeWeb.register_uri(:get, "http://missing%40gmail.com:password@plugins.jaxgl.com/profile", :response => fixture('web/plugins/author/login_not_found.xml.http'))
FakeWeb.register_uri(:get, "http://missing%40gmail.com:invalid@plugins.jaxgl.com/profile", :response => fixture('web/plugins/author/login_password_invalid.xml.http'))
FakeWeb.register_uri(:post, "http://missing%40gmail.com:password@plugins.jaxgl.com/profile", :response => fixture('web/plugins/author/create_account.xml.http'))
FakeWeb.register_uri(:get, "http://sinisterchipmunk%40gmail.com:password@plugins.jaxgl.com/profile", :response => fixture('web/plugins/author/login_existing_account.xml.http'))
# FakeWeb.register_uri(:post, "http://sinisterchipmunk%40gmail.com:password@plugins.jaxgl.com/author/plugins", :response => fixture('web/plugins/author/create_new_plugin.xml.http'))
FakeWeb.register_uri(:post, "http://plugins.jaxgl.com/plugins", :response => fixture('web/plugins/author/create_new_plugin.xml.http'))

RSpec.configure do |c|
  c.include Jax::Testing::RailsEnvironment
  c.include Rack::Test::Methods
  c.include FixturesHelper
  
  c.before(:each) do
    FileUtils.rm_rf File.expand_path("../tmp/cache", File.dirname(__FILE__))
    setup_rails_environment
  end
end
