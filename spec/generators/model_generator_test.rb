require 'test_helper'
require 'test_app'

class Jax::Generators::Model::ModelGeneratorTest < Jax::Generators::TestCase
  test "with no arguments" do
    generate 'character'
    
    assert_file "app/models/character.js"
    assert_directory "app/resources/characters/default.yml"
    assert_file "spec/javascripts/models/character_spec.js"
  end
end
