require 'test_helper'

class Jax::Generators::Plugin::PluginGeneratorTest < Jax::Generators::TestCase
  test "a clean new plugin" do
    generate "cloud"
    
    assert_file "vendor/plugins/cloud/install.rb"
    assert_file "vendor/plugins/cloud/uninstall.rb"
    
    # this really belongs in lib/jax/plugin_spec, no?
    # context "after Jax initializes" do
    #   subject { TestApp.instance }
    #   
    #   it "should detect presence of plugin" do
    #     subject.plugins.should_not be_empty
    #   end
    # 
    #   it "should add the plugin to shader load paths" do
    #     subject.shader_load_paths.should include("vendor/plugins/cloud/app/shaders")
    #   end
    # end
  end
  
  test "overwriting a locally conflicting name" do
    generate "cloud"
    File.open(File.join(destination_root, "vendor/plugins/cloud/custom"), "w") { |f| f.print "file contents" }
    stdin.returns "y\n"
    generate 'cloud'
    
    assert_no_file "vendor/plugins/cloud/custom"
    assert_directory "vendor/plugins/cloud"
  end
  
  test "using a conflicting name with --local" do
    result = generate "clouds", "--local"
    
    assert_no_match /aborted/, result
    assert_directory "vendor/plugins/clouds"
  end
  
  test "without remote name conflicts" do
    result = generate "cloud"
    
    assert_no_match /aborted/, result
    assert_directory "vendor/plugins/cloud"
  end
  
  test "aborting remote name conflicts" do
    stdin.returns "n\n"
    result = generate "clouds"
    
    assert_no_directory "vendor/plugins/clouds"
    assert_match /aborted/, result
  end
      
  test "allowing remote name conflicts" do
    stdin.returns "y\n"
    result = generate "clouds"
    
    assert_directory "vendor/plugins/clouds"
    assert_no_match /aborted/, result
  end
end
