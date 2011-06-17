require 'test_helper'
# require 'test_app'

class Jax::Generators::Material::MaterialGeneratorTest < Jax::Generators::TestCase
  test "with material name" do
    generate 'brick'

    assert_file "app/resources/materials/brick.yml"
  end
end
