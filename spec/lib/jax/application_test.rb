require 'test_helper'

class Jax::ApplicationTest < IsolatedTestCase
  def setup
    build_app
    app_file "app/shaders/clouds/fragment.ejs", "void main(void) { }"
    boot_app
  end
  
  test "shaders" do
    assert_not_nil Jax.application.shaders.find("clouds")
    assert_equal abs("app/shaders/clouds"), Jax.application.shaders.find("clouds").path
  end
  
  test "paths" do
    assert_contains Jax.root.to_s, Jax.application.javascript_source_roots
  end
end
