require 'test_helper'

class Jax::Generators::Packager::PackageGeneratorTest < Jax::Generators::TestCase
  include TestHelpers::Paths
  include TestHelpers::Generation
  
  setup do
    build_app
    app_file "public/asset.txt", 'content'
    app_file 'app/helpers/my_helper.js', 'var MyHelper = "ONE";'
    app_file "app/models/my_model.js", "var MyModel = 'TWO';"
    app_file "app/resources/my_models/default.yml", "three: 3"
    app_file "app/resources/my_models/first.yml", "four: 4"

    plugin "cloud" do |p|
      p.write "app/shaders/cloud/vertex.ejs", "void main() { }"
      p.write "public/plugin-asset.txt", 'content'
      
      p.write 'app/helpers/plugin_helper.js', 'var PluginHelper = "ONE";'
      p.write "app/models/plugin_model.js", "var PluginModel = 'TWO';"
      p.write "app/resources/plugin_models/default.yml", "five: 5"
      p.write "app/resources/plugin_models/second.yml", "six: 6"
    end
    
    boot_app
    self.class.destination Jax.root.to_s
    @result = run_generator([])
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
