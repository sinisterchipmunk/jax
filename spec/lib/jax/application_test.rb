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
  
  test "reloading" do
    # shaders
    assert_match /#{Regexp::escape("void main(void) { }")}/, Jax.application.shaders.find("clouds").fragment

    app_file "app/shaders/clouds/fragment.ejs", "void main(void) { gl_FragColor = vec4(1,1,1,1); }"
    assert_match /#{Regexp::escape("void main(void) { gl_FragColor = vec4(1,1,1,1); }")}/,
                 Jax.application.shaders.find("clouds").fragment
  end
  
  test "paths" do
    assert_contains Jax.root.to_s, Jax.application.javascript_source_roots
  end
end
