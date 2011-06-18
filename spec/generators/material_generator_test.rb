require 'test_helper'
# require 'test_app'

class Jax::Generators::Material::MaterialGeneratorTest < Jax::Generators::TestCase
  test "with material name" do
    generate 'brick'

    assert_file "app/resources/materials/brick.yml"
  end
  
  include TestHelpers::Paths
  include TestHelpers::Generation

  test "in plugin" do
    build_app
    plugin_generator 'clouds'
    boot_app
    
    generate "brick"
    assert_file "vendor/plugins/clouds/app/resources/materials/brick.yml"
  end
end
