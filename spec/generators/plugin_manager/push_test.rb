require 'test_helper'
# require 'test_app'

class Jax::Generators::Plugin::PluginManagerPushTest < Jax::Generators::TestCase
  tests Jax::Generators::Plugin::PluginManager
  
  include TestHelpers::Paths
  include TestHelpers::Generation
  
  test "push plugin with edited manifest" do
    build_app
    plugin_generator 'clouds'
    boot_app

    manifest = Jax.application.plugins.first.manifest
    manifest.description = "a cloudy day"
    manifest.save
    
    # how to test success? A file has been uploaded. For now we'll just verify nothing raised...
    assert_nothing_raised do
      result = generate "push"
    end
  end

  test "push plugin with default manifest" do
    build_app
    plugin_generator 'clouds'
    boot_app

    result = generate "push"
    
    assert_match /enter a plugin description/, result
  end

  test "push plugin without manifest" do
    build_app
    plugin_generator 'clouds'
    boot_app

    manifest = File.join(app_path, "vendor/plugins/clouds/manifest.yml")
    FileUtils.rm manifest if File.file?(manifest)

    result = generate "push"
  
    assert_match /manifest is missing/i, result
    assert_file manifest
  end
  
  test "push plugin outside plugin dir" do
    build_app
    plugin 'clouds'
    boot_app
    
    result = generate "push"
    assert_match /aborted/i, result
  end
end
