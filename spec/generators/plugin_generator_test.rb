require 'test_helper'
# require 'test_app'

class Jax::Generators::Plugin::PluginGeneratorTest < Jax::Generators::TestCase
  EXPECTED_FILES = %w(
    vendor/plugins/cloud/init.rb
    vendor/plugins/cloud/install.rb
    vendor/plugins/cloud/uninstall.rb
    vendor/plugins/cloud/config/routes.rb
  )
  
  setup do
    Jax.plugin_repository_url = Jax.default_plugin_repository_url
  end
  
  test "remote repo unavailable with confirmation" do
    Jax.application.plugin_repository_url = "http://nowhere.example.com"
    
    stdin.returns "y\n"
    result = generate "cloud"
    
    assert_match /an error occurred/i, result
    EXPECTED_FILES.each do |fi|
      assert_file fi
    end
  end
  
  test "remote repo unavailable with abort" do
    Jax.application.plugin_repository_url = "http://nowhere.example.com"
    
    stdin.returns "n\n"
    result = generate "cloud"
    
    assert_match /aborted/, result
    EXPECTED_FILES.each do |fi|
      assert_no_file fi
    end
  end
  
  test "a new plugin not in repo" do
    # is this not a double of 'clean new plugin'? why does that one not fail?
    # probably screwed up the fixture somehow. wutevs, this test is the real
    # deal.
    generate "missing"
    
    EXPECTED_FILES.each do |fi|
      assert_file fi.gsub(/cloud/, 'missing')
    end
  end
  
  test "a clean new plugin" do
    generate "cloud"
    
    EXPECTED_FILES.each do |fi|
      assert_file fi
    end
  end
  
  test "files" do
    generate "cloud"
    
    EXPECTED_FILES.each do |path|
      assert_file path
    end
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
