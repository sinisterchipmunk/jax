require 'test/unit'
require 'turn'

$:.unshift File.expand_path("../lib", File.dirname(__FILE__))
require File.join(File.dirname(__FILE__), "../lib/jax")
require File.join(File.dirname(__FILE__), "../lib/jax/generators/app")
require File.join(File.dirname(__FILE__), "../lib/jax/generators/commands")

require 'fakeweb'

class TestApp < Jax::Application
end
TestApp.config.root = File.expand_path("fixtures/tmp/generator_tests", File.dirname(__FILE__))

Dir[File.join(File.dirname(__FILE__), 'support/**/*.rb')].each do |fi|
  require fi
end

include FixturesHelper
FakeWeb.allow_net_connect = false
FakeWeb.register_uri(:get, "http://plugins.jaxgl.com/plugins", :response => fixture('web/plugins/all.xml'))
FakeWeb.register_uri(:get, "http://plugins.jaxgl.com/plugins/cloud", :response => fixture('web/plugins/clouds.xml'))
FakeWeb.register_uri(:get, "http://plugins.jaxgl.com/plugins/clouds", :response => fixture('web/plugins/clouds.xml'))
FakeWeb.register_uri(:get, "http://plugins.jaxgl.com/plugins/vertex-blob", :response => fixture('web/plugins/vertex-blob.xml'))
FakeWeb.register_uri(:get, "http://plugins.jaxgl.com/plugins/vertex-height-map", :response => fixture('web/plugins/vertex-height-map.xml'))
FakeWeb.register_uri(:get, "http://plugins.jaxgl.com/plugins/vert", :response => fixture('web/plugins/vert.xml'))
FakeWeb.register_uri(:get, "http://plugins.jaxgl.com/plugins/clouds.tgz?version=1.0.2", :response => fixture('web/plugins/example.tgz.http'))
FakeWeb.register_uri(:get, "http://plugins.jaxgl.com/plugins/clouds.tgz?version=1.0.0", :response => fixture('web/plugins/example.tgz.http'))
FakeWeb.register_uri(:get, "http://plugins.jaxgl.com/plugins/vertex-blob.tgz?version=1.0.0", :response => fixture('web/plugins/example.tgz.http'))
FakeWeb.register_uri(:get, "http://plugins.jaxgl.com/plugins/vertex-height-map.tgz?version=1.0.1", :response => fixture('web/plugins/example.tgz.http'))
