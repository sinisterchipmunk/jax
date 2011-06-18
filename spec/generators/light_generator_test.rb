require 'test_helper'

class Jax::Generators::LightSource::LightSourceGeneratorTest < Jax::Generators::TestCase
  test "with light name" do
    generate 'torch'
  
    assert_file "app/resources/light_sources/torch.yml"
  end
  
  test "with directional" do
    generate 'torch', 'directional'
    
    assert_file 'app/resources/light_sources/torch.yml' do |content|
      assert_no_match /position/, content
    end
  end
  
  test "with point" do
    generate 'torch', 'point'
    
    assert_file 'app/resources/light_sources/torch.yml' do |content|
      assert_no_match /direction/, content
    end
  end
  
  include TestHelpers::Paths
  include TestHelpers::Generation

  test "in plugin" do
    build_app
    plugin_generator 'clouds'
    boot_app
    
    generate "torch", "directional"
    assert_file "vendor/plugins/clouds/app/resources/light_sources/torch.yml"
  end
end
