require 'test_helper'
# require 'test_app'

class Jax::Generators::Model::ModelGeneratorTest < Jax::Generators::TestCase
  test "with no arguments" do
    generate 'character'
    
    assert_file "app/models/character.js"
    assert_file "app/resources/characters/default.yml"
    assert_file "spec/javascripts/models/character_spec.js"
  end

  include TestHelpers::Paths
  include TestHelpers::Generation

  test "in plugin" do
    build_app
    plugin_generator 'clouds'
    boot_app
    
    generate "character"
    assert_file "vendor/plugins/clouds/app/models/character.js"
    assert_file "vendor/plugins/clouds/app/resources/characters/default.yml"
    assert_file "vendor/plugins/clouds/spec/javascripts/models/character_spec.js"
  end
end
