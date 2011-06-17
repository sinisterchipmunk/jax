require 'test_helper'

class Jax::PluginTest < IsolatedTestCase
  def setup
    build_app
    plugin "cloud" do |p|
      p.write "app/shaders/cloud/vertex.ejs", "void main() { }"
    end
    
    boot_app
  end
  
  test "should detect presence of plugin" do
    assert_not_empty Jax.application.plugins
  end
  
  test "should add the plugin to shader load paths" do
    assert_not_nil Jax.application.shaders.find("cloud")
    assert_equal File.join(app_path, "vendor/plugins/cloud/app/shaders/cloud"),
                 Jax.application.shaders.find("cloud").path
  end
end
