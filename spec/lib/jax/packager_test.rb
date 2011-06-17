require 'test_helper'

class Jax::Generators::Packager::PackageGeneratorTest < Jax::Generators::TestCase
  include TestHelpers::Paths
  include TestHelpers::Generation
  
  setup do
    build_app
    app_file "public/asset.txt", 'content'
    plugin "cloud" do |p|
      p.write "app/shaders/cloud/vertex.ejs", "void main() { }"
      p.write "public/plugin-asset.txt", 'content'
    end
    
    boot_app
    self.class.destination Jax.root.to_s
    @result = run_generator([])
  end
  
  test "assets" do
    assert_file "pkg/asset.txt"
    assert_file "pkg/plugin-asset.txt"
  end
end
