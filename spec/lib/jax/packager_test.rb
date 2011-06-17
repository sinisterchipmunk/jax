require 'test_helper'

class Jax::Generators::Packager::PackageGeneratorTest < Jax::Generators::TestCase
  include TestHelpers::Paths
  include TestHelpers::Generation
  
  setup do
    build_app
    app_file "public/asset.txt", 'content'
    app_file 'app/helpers/my_helper.js', 'var MyHelper = "ONE";'
    app_file "app/models/my_model.js", "//= require <support.js>\nvar MyModel = 'TWO';"
    app_file "app/resources/my_models/default.yml", "three: 3"
    app_file "app/resources/my_models/first.yml", "four: 4"
    app_file "app/controllers/my_controller.js", "//= require \"application_controller.js\"\nvar MyController = Jax.Controller.create('my', ApplicationController, {});"
    app_file "lib/support.js", "var SUPPORT = 1.0;"

    plugin "cloud" do |p|
      p.write "app/shaders/cloud/vertex.ejs", "void main() { }"
      p.write "public/plugin-asset.txt", 'content'
      
      p.write 'app/helpers/plugin_helper.js', 'var PluginHelper = "ONE";'
      p.write "app/models/plugin_model.js", "//= require <plugin/support.js>\nvar PluginModel = 'TWO';"
      p.write "app/resources/plugin_models/default.yml", "five: 5"
      p.write "app/resources/plugin_models/second.yml", "six: 6"
      p.write "app/controllers/plugin_controller.js", "//= require <application_controller.js>\nvar PluginController = Jax.Controller.create('plugin', ApplicationController, {});"
      p.write "lib/plugin/support.js", "var PLUGIN_SUPPORT = 1.0;"
    end
    
    boot_app
    self.class.destination Jax.root.to_s
    @result = run_generator([])
  end
  
  test "lib" do
    assert_file "pkg/javascripts/app_template.js" do |content|
      assert_match /var SUPPORT = 1.0;/, content
      assert_match /var PLUGIN_SUPPORT = 1.0;/, content
    end
  end
  
  test "controllers" do
    assert_file "pkg/javascripts/app_template.js" do |content|
      # app and plugin controllers should both exist
      assert_match /var MyController = Jax.Controller.create\('my', ApplicationController/, content
      assert_match /var PluginController = Jax.Controller.create\('plugin', ApplicationController/, content
      
      # application controller should precede both
      assert_match /ApplicationController\s*=.*?MyController\s*=/m, content
      assert_match /ApplicationController\s*=.*?PluginController\s*=/m, content
    end
  end
  
  test "assets" do
    assert_file "pkg/asset.txt"
    assert_file "pkg/plugin-asset.txt"
  end
  
  test "models" do
    assert_file "pkg/javascripts/app_template.js" do |content|
      assert_match /var MyModel = 'TWO';/, content
      assert_match /var PluginModel = 'TWO';/, content
    end
  end
  
  test "resources" do
    assert_file "pkg/javascripts/app_template.js" do |content|
      content =~ /MyModel.addResources\((.*)?\)/
      assert_not_nil $1, "MyModel has no resources"
      hash = ActiveSupport::JSON.decode($1)
      assert_equal 3, hash['default']['three']
      assert_equal 4, hash['first']['four']

      content =~ /PluginModel.addResources\((.*)?\)/
      assert_not_nil $1, "PluginModel has no resources"
      hash = ActiveSupport::JSON.decode($1)
      assert_equal 5, hash['default']['five']
      assert_equal 6, hash['second']['six']
    end
  end

  test "helpers" do
    assert_file "pkg/javascripts/app_template.js" do |content|
      assert_match /var MyHelper = "ONE";/, content
      assert_match /var PluginHelper = "ONE";/, content
    end
  end
end
