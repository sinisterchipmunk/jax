require 'test_helper'
require 'test_app'

class Jax::Generators::Controller::ControllerGeneratorTest < Jax::Generators::TestCase
  setup :copy_routes

  test "with no arguments" do
    generate 'welcome'
    
    assert_file "app/controllers/welcome_controller.js", /^var WelcomeController \=/
    assert_file "app/helpers/welcome_helper.js"
    assert_file "spec/javascripts/controllers/welcome_controller_spec.js"
  end
  
  test "with arguments" do
    generate "welcome", "index"
    
    assert_file "app/controllers/welcome_controller.js", /^\s*index: function\(\)\s*\{/
    assert_file "app/views/welcome/index.js"
    assert_file "config/routes.rb", /^  map ['"]welcome\/index["']/
  end
end
