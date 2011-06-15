require 'test_helper'

class Jax::Generators::Plugin::PluginManagerTest < Jax::Generators::TestCase
  test "uninstall plugin with install.rb and uninstall.rb calls uninstall.rb but not install.rb" do
    $install_loaded = $uninstall_loaded = 0
    stub_file "vendor/plugins/clouds/install.rb", "$install_loaded = 1"
    stub_file "vendor/plugins/clouds/uninstall.rb", "$uninstall_loaded = 1"
    
    generate "uninstall", "clouds"
    assert_equal 0, $install_loaded
    assert_equal 1, $uninstall_loaded
  end

  test "uninstall missing plugin" do
    result = generate "uninstall", "clouds"
    
    assert_match /aborted/, result
    assert_match /Plugin 'clouds' does not seem to be installed./, result
  end

  test "uninstall previously installed with inexact multiple matches, selecting all" do
    generate 'install', 'clouds'
    generate 'install', 'vertex-height-map'
    generate 'install', 'vertex-blob'
    
    stdin.returns "0\n"
    generate "uninstall", "vertex"
    
    assert_no_directory "vendor/plugins/vertex-height-map"
    assert_no_directory "vendor/plugins/vertex-blob"
    assert_directory "vendor/plugins/clouds" # because it doesn't match 'vertex*'
  end

  test "uninstall previously installed with inexact multiple matches, selecting one" do
    generate 'install', 'clouds'
    generate 'install', 'vertex-height-map'
    generate 'install', 'vertex-blob'
    
    stdin.returns "2\n"
    generate "uninstall", "vertex"
    
    assert_no_directory "vendor/plugins/vertex-height-map"
    assert_directory "vendor/plugins/vertex-blob"
    assert_directory "vendor/plugins/clouds"
  end
  
  test "uninstall previously installed with inexact single match aborted" do
    generate 'install', 'clouds'
    generate 'install', 'vertex-height-map'
    generate 'install', 'vertex-blob'
    
    stdin.returns "n\n"
    generate "uninstall", "cloud"
    
    assert_directory "vendor/plugins/clouds"
  end
  
  test "uninstall previously installed with inexact single match confirmed" do
    generate 'install', 'clouds'
    generate 'install', 'vertex-height-map'
    generate 'install', 'vertex-blob'
    
    stdin.returns "y\n"
    generate "uninstall", "cloud"
    
    assert_no_directory "vendor/plugins/clouds"
  end
      
  test "uninstall exact match" do
    generate 'install', 'clouds'
    generate 'install', 'vertex-height-map'
    generate 'install', 'vertex-blob'
    generate "uninstall", "clouds"
  
    assert_directory "vendor/plugins/vertex-height-map"
    assert_directory "vendor/plugins/vertex-blob"
    assert_no_directory "vendor/plugins/clouds"
  end
  
  test "install with install.rb and uninstall.rb" do
    $install_loaded = $uninstall_loaded = 0
    generate "install", "clouds"
    
    assert_equal 1, $install_loaded
    assert_equal 0, $uninstall_loaded
  end
  
  test 'install with default multiple matches' do
    stdin.returns "2"
    generate "install", "vert"
    
    assert_directory "vendor/plugins/vertex-blob"
    assert_no_directory "vendor/plugins/vertex-height-map"
  end
    
  test 'install with default single inexact match confirmed' do
    stdin.returns "y\n"
    generate "install", "cloud"

    assert_directory "vendor/plugins/clouds"
  end
    
  test 'install with default single inexact match aborted' do
    stdin.returns "n\n"
    generate 'install', 'cloud'
    
    assert_no_directory "vendor/plugins/clouds"
  end
  
  test "install with default exact match" do
    result = generate 'install', 'clouds'
  
    assert_directory 'vendor/plugins/clouds'
    assert_match /1\.0\.2/, result
  end
  
  test "install with old version exact match" do
    result = generate 'install', 'clouds', '--version=1.0.0'
  
    assert_directory "vendor/plugins/clouds"
    assert_match /1\.0\.0/, result
  end

  test "install with old version shorthand exact match" do
    result = generate 'install', 'clouds', '-v=1.0.0'
  
    assert_directory "vendor/plugins/clouds"
    assert_match /1\.0\.0/, result
  end

  test 'list local only with plugins installed with a filter' do
    generate 'install', 'vertex-blob', 'vertex-height-map'
    result = generate 'list', 'vertex-b', '--local'
  
    assert_match /vertex-blob/, result
    assert_match /#{Regexp::escape 'Adds a shader that deforms meshes, producing "blobs".'}/, result
    assert_no_match /vertex-height-map/, result
    assert_no_match /#{Regexp::escape 'Adds a height map generated dynamically in the vertex sha'}/, result
  end

  test 'list local only with plugins installed' do
    generate 'install', 'vertex-blob', 'vertex-height-map'
    result = generate 'list', '--local'
  
    assert_match /vertex-blob/, result
    assert_match /#{Regexp::escape 'Adds a shader that deforms meshes, producing "blobs".'}/, result
    assert_match /vertex-height-map/, result
    assert_match /#{Regexp::escape 'Adds a height map generated dynamically in the vertex sha'}/, result
    assert_no_match /clouds/, result
    assert_no_match /#{Regexp::escape 'Adds a shader for dynamic cloud generation.'}/, result
  end

  test "list local only with no plugins installed" do
    result = generate "list", "--local"
  
    assert_match /There do not seem to be any plugins installed for this application./, result
  end

  test "list summary" do  
    result = generate 'list'

    assert_match /Adds a height map generated dynamically in the vertex sha\.\.\./, result
  end
  
  test 'list detail' do
    result = generate 'list', '--detailed'
    
    assert_match /Adds a height map generated dynamically in the vertex shader using Perlin noise\./, result
  end

  test 'list (all)' do
    result = generate 'list'  
  
    assert_match /vertex-height-map/, result
    assert_match /clouds/, result
  end

  test 'list vertex-height-map' do
    result = generate 'list', 'vertex-height-map'
  
    assert_match /vertex-height-map/, result
    assert_no_match /clouds/, result
  end

  test 'list clouds' do
    result = generate 'list', 'clouds'
  
    assert_no_match /vertex-height-map/, result
    assert_match /clouds/, result
  end
end
