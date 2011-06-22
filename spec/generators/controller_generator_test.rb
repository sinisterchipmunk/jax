require 'test_helper'

class Jax::Generators::Controller::ControllerGeneratorTest < Jax::Generators::TestCase
  setup :copy_routes

  test "with no arguments" do
    # since this test was first written, it's become apparent that the 'index' action is
    # pretty much ubiquitous -- enough so that it's safe to auto-generate it if omitted.

    generate 'welcome'
    
    assert_file "app/controllers/welcome_controller.js", /^\s*index: function\(\)\s*\{/
    assert_file "app/views/welcome/index.js"
    assert_file "config/routes.rb", /^  map ['"]welcome\/index["']/
    assert_file "spec/javascripts/controllers/welcome_controller_spec.js"
  end
  
  test "with --root option" do
    generate 'welcome', '--root'
    
    assert_file "config/routes.rb", /root ['"]welcome["']/
  end
  
  test "with arguments" do
    generate "welcome", "index"
    
    assert_file "app/controllers/welcome_controller.js", /^\s*index: function\(\)\s*\{/
    assert_file "app/views/welcome/index.js"
    assert_file "config/routes.rb", /^  map ['"]welcome\/index["']/
    assert_file "spec/javascripts/controllers/welcome_controller_spec.js"
  end
  
  include TestHelpers::Paths
  include TestHelpers::Generation

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
