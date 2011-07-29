require 'test_helper'

class Jax::ReloadingTest < IsolatedTestCase
  def setup
    build_app
    app_file "app/shaders/clouds/fragment.ejs", "void main(void) { }"
    boot_app
  end
  
  test "shaders" do
    assert_match /#{Regexp::escape("void main(void) { }")}/, Jax.application.shaders.find("clouds").fragment

    app_file "app/shaders/clouds/fragment.ejs", "void main(void) { gl_FragColor = vec4(1,1,1,1); }"
    assert_match /#{Regexp::escape("void main(void) { gl_FragColor = vec4(1,1,1,1); }")}/,
                 Jax.application.shaders.find("clouds").fragment
  end

  test "resources" do
    assert_not_match(/#{Regexp::escape "Door"}/, Jax.application.resources.to_s)
    app_file "app/resources/doors/default.yml", "one: 1"
    assert_match(/#{Regexp::escape "Door"}/, Jax.application.resources.to_s)
  end
end
