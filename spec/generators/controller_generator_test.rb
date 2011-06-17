require 'test_helper'

class Jax::Generators::Controller::ControllerGeneratorTest < Jax::Generators::TestCase
  include TestHelpers::Paths
  include TestHelpers::Generation
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
    assert_file "spec/javascripts/controllers/welcome_controller_spec.js"
  end
  
  test "in plugin" do
    build_app
    plugin_generator 'clouds'
    boot_app
    
    generate "welcome", "index"
    assert_file "vendor/plugins/clouds/app/controllers/welcome_controller.js", /^\s*index: function\(\)\s*\{/
    assert_file "vendor/plugins/clouds/app/views/welcome/index.js"
    assert_file "vendor/plugins/clouds/config/routes.rb", /^  map ['"]welcome\/index["']/
    assert_file "vendor/plugins/clouds/spec/javascripts/controllers/welcome_controller_spec.js"
  end
end
