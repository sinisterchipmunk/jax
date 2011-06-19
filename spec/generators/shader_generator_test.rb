require 'test_helper'
# require 'test_app'

class Jax::Generators::Shader::ShaderGeneratorTest < Jax::Generators::TestCase
  include TestHelpers::Paths
  include TestHelpers::Generation

  EXPECTED_FILES = %w(
    app/shaders/clouds/common.ejs
    app/shaders/clouds/fragment.ejs
    app/shaders/clouds/manifest.yml
    app/shaders/clouds/material.js
    app/shaders/clouds/vertex.ejs
    spec/javascripts/shaders/clouds_spec.js
  )
  
  test "generator" do
    build_app
    boot_app
    self.class.destination app_path
    generate 'clouds'
    
    EXPECTED_FILES.each do |fi|
      assert_file fi
    end
  end

  test "in plugin" do
    build_app
    plugin_generator 'clouds'
    boot_app
    
    generate "clouds"
    EXPECTED_FILES.each do |fi|
      assert_file File.join("vendor/plugins/clouds", fi)
    end
  end
end
