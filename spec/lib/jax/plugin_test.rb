require 'test_helper'

# see also ./packager_test.rb for plugin stuff related to app packaging

class Jax::PluginTest < IsolatedTestCase
  def setup
    build_app
    plugin "cloud" do |p|
      p.write "app/shaders/cloud/vertex.ejs", "void main() { }"
    end
    
    boot_app
  end
  
  test "detecting presence of plugin" do
    assert_not_empty Jax.application.plugins
  end
  
  test "plugin shaders" do
    assert_not_nil Jax.application.shaders.find("cloud")
    assert_equal abs("vendor/plugins/cloud/app/shaders/cloud"), Jax.application.shaders.find("cloud").path
  end
  
  test "plugin paths" do
    assert_contains abs("vendor/plugins/cloud"), Jax.application.javascript_source_roots
  end
end
