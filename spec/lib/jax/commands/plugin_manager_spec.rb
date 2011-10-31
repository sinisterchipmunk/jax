require 'spec_helper'

describe Jax::PluginManager do
  def shell
    @shell ||= GenSpec::Shell.new
  end
  
  def input(str)
    shell.new shell.output, str
  end

  def generate(*args)
    Jax::PluginManager.start args, :shell => shell,
                                                        :destination_root => ::Rails.application.root
    shell.output.string.tap { shell.new }
  end
  
  it "uninstall plugin with install.rb and uninstall.rb calls uninstall.rb but not install.rb" do
    $install_loaded = $uninstall_loaded = 0
    create_file "vendor/plugins/clouds/install.rb", "$install_loaded = 1"
    create_file "vendor/plugins/clouds/uninstall.rb", "$uninstall_loaded = 1"
    
    generate "uninstall", "clouds"
    $install_loaded.should == 0
    $uninstall_loaded.should == 1
  end
  
  it "uninstall missing plugin" do
    result = generate "uninstall", "clouds"
    
    result.should =~ /aborted/
    result.should =~ /Plugin 'clouds' does not seem to be installed./
  end

  it "uninstall previously installed with inexact multiple matches, selecting all" do
    generate 'install', 'clouds'
    generate 'install', 'vertex-height-map'
    generate 'install', 'vertex-blob'
    
    input "0\n"
    generate "uninstall", "vertex"
    
    File.should_not be_directory(local "vendor/plugins/vertex-height-map")
    File.should_not be_directory(local "vendor/plugins/vertex-blob")
    File.should be_directory(local "vendor/plugins/clouds") # because it doesn't match 'vertex*'
  end

  it "uninstall previously installed with inexact multiple matches, selecting one" do
    generate 'install', 'clouds'
    generate 'install', 'vertex-height-map'
    generate 'install', 'vertex-blob'
    
    input "2\n"
    generate "uninstall", "vertex"
    
    File.should_not be_directory(local "vendor/plugins/vertex-height-map")
    File.should be_directory(local "vendor/plugins/vertex-blob")
    File.should be_directory(local "vendor/plugins/clouds")
  end
  
  it "uninstall previously installed with inexact single match aborted" do
    generate 'install', 'clouds'
    generate 'install', 'vertex-height-map'
    generate 'install', 'vertex-blob'
    
    input "n\n"
    generate "uninstall", "cloud"
    
    File.should be_directory(local "vendor/plugins/clouds")
  end
  
  it "uninstall previously installed with inexact single match confirmed" do
    generate 'install', 'clouds'
    generate 'install', 'vertex-height-map'
    generate 'install', 'vertex-blob'
    
    input "y\n"
    generate "uninstall", "cloud"
    
    File.should_not be_directory(local "vendor/plugins/clouds")
  end
      
  it "uninstall exact match" do
    generate 'install', 'clouds'
    generate 'install', 'vertex-height-map'
    generate 'install', 'vertex-blob'
    generate "uninstall", "clouds"
  
    File.should be_directory(local "vendor/plugins/vertex-height-map")
    File.should be_directory(local "vendor/plugins/vertex-blob")
    File.should_not be_directory(local "vendor/plugins/clouds")
  end
  
  it "install with install.rb and uninstall.rb" do
    $install_loaded = $uninstall_loaded = 0
    generate "install", "clouds"
    
    $install_loaded.should == 1
    $uninstall_loaded.should == 0
  end
  
  it 'install with default multiple matches' do
    input "2"
    generate "install", "vert"
    
    File.should_not be_directory(local "vendor/plugins/vertex-height-map")
    File.should be_directory(local "vendor/plugins/vertex-blob")
  end
    
  it 'install with default single inexact match confirmed' do
    input "y\n"
    generate "install", "cloud"

    File.should be_directory(local "vendor/plugins/clouds")
  end
    
  it 'install with default single inexact match aborted' do
    input "n\n"
    generate 'install', 'cloud'
    
    File.should_not be_directory(local "vendor/plugins/clouds")
  end
  
  it "install with default exact match" do
    result = generate 'install', 'clouds'
  
    File.should be_directory(local "vendor/plugins/clouds")
    result.should =~ /1\.0\.2/
  end
  
  it "install with old version exact match" do
    result = generate 'install', 'clouds', '--version=1.0.0'
  
    File.should be_directory(local "vendor/plugins/clouds")
    result.should =~ /1\.0\.0/
  end

  it "install with old version shorthand exact match" do
    result = generate 'install', 'clouds', '-v=1.0.0'
  
    File.should be_directory(local "vendor/plugins/clouds")
    result.should =~ /1\.0\.0/
  end

  it 'list local only with plugins installed with a filter' do
    generate 'install', 'vertex-blob', 'vertex-height-map'
    result = generate 'list', 'vertex-b', '--local'
  
    result.should =~ /vertex-blob/
    result.should =~ /#{Regexp::escape 'Adds a shader that deforms meshes, producing "blobs".'}/
    result.should_not =~ /vertex-height-map/
    result.should_not =~ /#{Regexp::escape 'Adds a height map generated dynamically in the vertex sha'}/
  end

  it 'list local only with plugins installed' do
    generate 'install', 'vertex-blob', 'vertex-height-map'
    result = generate 'list', '--local'
  
    result.should =~ /vertex-blob/
    result.should =~ /#{Regexp::escape 'Adds a shader that deforms meshes, producing "blobs".'}/
    result.should =~ /vertex-height-map/
    result.should =~ /#{Regexp::escape 'Adds a height map generated dynamically in the vertex sha'}/
    result.should_not =~ /clouds/
    result.should_not =~ /#{Regexp::escape 'Adds a shader for dynamic cloud generation.'}/
  end

  it "list local only with no plugins installed" do
    result = generate "list", "--local"
  
    result.should =~ /There do not seem to be any plugins installed for this application./
  end

  it "list summary" do  
    result = generate 'list'

    result.should =~ /Adds a height map generated dynamically in the vertex sha\.\.\./
  end
  
  it 'list detail' do
    result = generate 'list', '--detailed'
    
    result.should =~ /Adds a height map generated dynamically in the vertex shader using Perlin noise\./
  end

  it 'list (all)' do
    result = generate 'list'  
  
    result.should =~ /vertex-height-map/
    result.should =~ /clouds/
  end

  it 'list vertex-height-map' do
    result = generate 'list', 'vertex-height-map'
  
    result.should =~ /vertex-height-map/
    result.should_not =~ /clouds/
  end

  it 'list clouds' do
    result = generate 'list', 'clouds'
  
    result.should_not =~ /vertex-height-map/
    result.should =~ /clouds/
  end
end