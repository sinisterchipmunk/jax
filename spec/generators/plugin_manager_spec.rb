require 'spec_helper'

pwd = File.join(Dir.pwd, "generator_tests")

describe Jax::Generators::Plugin::PluginManager do
  def shell
    @shell ||= SpecShell.new
  end
  
  def generator
    Jax::Generators::Plugin::PluginManager
  end
  
  def generate(*args)
    generator.start(args + ['--debug'], :shell => shell)
  end

  before :each do
    FileUtils.rm_rf pwd
    Dir.chdir File.expand_path('..', pwd)
    FileUtils.mkdir_p pwd
    Dir.chdir pwd
    TestApp.config.root = pwd
  end

  after :each do
    FileUtils.rm_rf pwd
    Dir.chdir File.expand_path('..', pwd)
  end
  
  context "#uninstall" do
    context "plugin with install.rb and uninstall.rb" do
      before(:each) do
        File.stub!(:exist?).with(File.join(pwd, "vendor/plugins/clouds")).and_return true
      end
      
      it "should not call install.rb" do
        File.stub!(:exist?).with(File.join(pwd, "vendor/plugins/clouds/install.rb")).and_return(false)
        File.stub!(:exist?).with(File.join(pwd, "vendor/plugins/clouds/uninstall.rb")).and_return(false)
        generator.desc "any_instance", "noop" # to silence warnings
        generator.any_instance.should_not_receive(:load)
        generate('uninstall', 'clouds')
      end
    
      it "should call uninstall.rb" do
        File.stub!(:exist?).with(File.join(pwd, "vendor/plugins/clouds/install.rb")).and_return(false)
        File.stub!(:exist?).with(File.join(pwd, "vendor/plugins/clouds/uninstall.rb")).and_return(true)
        generator.desc "any_instance", "noop" # to silence warnings
        generator.any_instance.should_receive(:load).with(File.join(pwd, "vendor/plugins/clouds/uninstall.rb")).and_return
        generate('uninstall', 'clouds')
      end
    end

    context "missing" do
      before(:each) { generate "uninstall", "clouds" }
      
      it "should abort with message" do
        shell.output.string.should =~ /aborted/
        shell.output.string.should =~ /Plugin 'clouds' does not seem to be installed./
      end
    end
    
    context "previously installed" do
      before(:each) do
        generate "install", "clouds"
        generate "install", "vertex-height-map"
        generate "install", "vertex-blob"
        
        File.should be_directory(File.join(pwd, "vendor/plugins/clouds"))
      end
      
      context "inexact multiple matches" do
        context "with selection 'all'" do
          before(:each) do
            shell.stdin.should_receive(:gets).and_return("0\n")
            generate "uninstall", "vertex"
          end
        
          it "should delete the 'vertex-height-map' plugin" do
            File.should_not be_directory(File.join(pwd, "vendor/plugins/vertex-height-map"))
          end
        
          it "should delete the 'vertex-blob' plugin" do
            File.should_not be_directory(File.join(pwd, "vendor/plugins/vertex-blob"))
          end
        end
        
        context "with selection 2" do
          before(:each) do
            shell.stdin.should_receive(:gets).and_return("2\n")
            generate "uninstall", "vertex"
          end
        
          it "should delete the 'vertex-height-map' plugin" do
            File.should_not be_directory(File.join(pwd, "vendor/plugins/vertex-height-map"))
          end
        
          it "should not delete the 'vertex-blob' plugin" do
            File.should be_directory(File.join(pwd, "vendor/plugins/vertex-blob"))
          end
        end
      end
      
      context "inexact single match" do
        context "with abort" do
          before(:each) do
            shell.stdin.should_receive(:gets).and_return("n\n")
            generate "uninstall", "cloud"
          end
          
          it "should not delete the 'clouds' plugin" do
            File.should be_directory(File.join(pwd, "vendor/plugins/clouds"))
          end
        end
        
        context "with confirmation" do
          before(:each) do
            shell.stdin.should_receive(:gets).and_return("y\n")
            generate "uninstall", "cloud"
          end
          
          it "should delete the 'clouds' plugin" do
            File.should_not be_directory(File.join(pwd, "vendor/plugins/clouds"))
          end
        end
      end
      
      context "exact match" do
        before(:each) do
          generate "uninstall", "clouds"
        end
        
        it "should not remove the other directories" do
          File.should be_directory(File.join(pwd, "vendor/plugins/vertex-height-map"))
          File.should be_directory(File.join(pwd, "vendor/plugins/vertex-blob"))
        end
        
        it "should remove the directory" do
          File.should_not be_directory(File.join(pwd, "vendor/plugins/clouds"))
        end
      end
    end
  end
  
  context '#install' do
    context "plugin with install.rb and uninstall.rb" do
      before(:each) do
        File.stub!(:exist?).with(File.join(pwd, "vendor/plugins/clouds")).and_return false
      end
      
      it "should call install.rb" do
        File.stub!(:exist?).with(File.join(pwd, "vendor/plugins/clouds/install.rb")).and_return(true)
        File.stub!(:exist?).with(File.join(pwd, "vendor/plugins/clouds/uninstall.rb")).and_return(false)
        generator.desc "any_instance", "noop" # to silence warnings
        generator.any_instance.should_receive(:load).with(File.join(pwd, "vendor/plugins/clouds/install.rb")).and_return
        generate('install', 'clouds')
      end
    
      it "should not call uninstall.rb" do
        File.stub!(:exist?).with(File.join(pwd, "vendor/plugins/clouds/install.rb")).and_return(false)
        File.stub!(:exist?).with(File.join(pwd, "vendor/plugins/clouds/uninstall.rb")).and_return(true)
        generator.desc "any_instance", "noop" # to silence warnings
        generator.any_instance.should_not_receive(:load)
        generate('install', 'clouds')
      end
    end
    
    context 'default multiple matches' do
      before(:each) do
        shell.stdin.should_receive(:gets).and_return('2')
        generate 'install', 'vert'
      end
      
      it "should install 'vertex-blob'" do
        File.should be_directory(File.join(pwd, "vendor/plugins/vertex-blob"))
      end
      
      it "should not install 'vertex-height-map'" do
        File.should_not be_directory(File.join(pwd, "vendor/plugins/vertex-height-map"))
      end
    end
    
    context 'default single inexact match confirmed' do
      before(:each) do
        shell.stdin.should_receive(:gets).and_return("y\n")
        generate 'install', 'cloud'
      end
      
      it "should install 'clouds'" do
        File.should be_directory(File.join(pwd, "vendor/plugins/clouds"))
      end
    end
    
    context 'default single inexact match aborted' do
      before(:each) do
        shell.stdin.should_receive(:gets).and_return("n\n")
        generate 'install', 'cloud'
      end
      
      it "should not install 'clouds'" do
        File.should_not be_directory(File.join(pwd, "vendor/plugins/clouds"))
      end
    end
    
    context "default exact match" do
      before(:each) { generate('install', 'clouds') }
    
      it "should create plugin directory" do
        File.should be_directory(File.join(pwd, "vendor/plugins/clouds"))
      end
    
      it "should print version 1.0.2" do
        shell.stdout.string.should =~ /1\.0\.2/
      end
    end
    
    context "old version exact match" do
      before(:each) { generate('install', 'clouds', '--version=1.0.0') }
    
      it "should create plugin directory" do
        File.should be_directory(File.join(pwd, "vendor/plugins/clouds"))
      end
      
      it "should print version 1.0.0" do
        shell.stdout.string.should =~ /1\.0\.0/
      end
    end

    context "old version shorthand exact match" do
      before(:each) { generate('install', 'clouds', '-v=1.0.0') }
    
      it "should create plugin directory" do
        File.should be_directory(File.join(pwd, "vendor/plugins/clouds"))
      end
      
      it "should print version 1.0.0" do
        shell.stdout.string.should =~ /1\.0\.0/
      end
    end
  end

  context '#list' do
    context "local only" do
      context "with plugins installed" do
        before(:each) do
          generate "install", "vertex-blob", "vertex-height-map"
          shell.clear
          generate "list", "--local"
        end
        
        context "with a filter" do
          before(:each) { shell.clear; generate "list", "vertex-b", "--local" }
          
          it "should list plugin info for 'vertex-blob'" do
            shell.stdout.string.should =~ /vertex-blob/
            shell.stdout.string.should =~ /#{Regexp::escape 'Adds a shader that deforms meshes, producing "blobs".'}/
          end

          it "should not list plugin info for 'vertex-height-map'" do
            shell.stdout.string.should_not =~ /vertex-height-map/
            shell.stdout.string.should_not =~ /#{Regexp::escape 'Adds a height map generated dynamically in the vertex sha'}/
          end
        end
        
        it "should list plugin info for 'vertex-blob'" do
          shell.stdout.string.should =~ /vertex-blob/
          shell.stdout.string.should =~ /#{Regexp::escape 'Adds a shader that deforms meshes, producing "blobs".'}/
        end

        it "should list plugin info for 'vertex-height-map'" do
          shell.stdout.string.should =~ /vertex-height-map/
          shell.stdout.string.should =~ /#{Regexp::escape 'Adds a height map generated dynamically in the vertex sha'}/
        end
        
        it "should not list plugin info for 'clouds'" do
          shell.stdout.string.should_not =~ /clouds/
          shell.stdout.string.should_not =~ /#{Regexp::escape 'Adds a shader for dynamic cloud generation.'}/
        end
      end
      
      context "with no plugins installed" do
        before(:each) { generate "list", "--local" }
      
        it "should say there are no plugins installed" do
          shell.stdout.string.should =~ /There do not seem to be any plugins installed for this application./
        end
      end
    end
    
    context 'summary' do
      before(:each) { generate("list") }
    
      it "should truncate long descriptions" do
        shell.stdout.string.should =~ /Adds a height map generated dynamically in the vertex sha\.\.\./
      end
    end
    
    context 'detail' do
      before(:each) { generate('list', '--detailed') }
      
      it "should include long description" do
        shell.stdout.string.should =~ /Adds a height map generated dynamically in the vertex shader using Perlin noise\./
      end
    end
    
    context '(all)' do
      before(:each) { generate("list") }
    
      it "should list vertex-height-map" do
        shell.stdout.string.should =~ /vertex-height-map/
      end
      
      it "should list clouds" do
        shell.stdout.string.should =~ /clouds/
      end
    end
    
    context 'vertex-height-map' do
      before(:each) { generate("list", "vertex-height-map") }
    
      it "should list vertex-height-map" do
        shell.stdout.string.should =~ /vertex-height-map/
      end
      
      it "should not list clouds" do
        shell.stdout.string.should_not =~ /clouds/
      end
    end

    context 'clouds' do
      before(:each) { generate("list", "clouds") }
    
      it "should not list vertex-height-map" do
        shell.stdout.string.should_not =~ /vertex-height-map/
      end
      
      it "should list clouds" do
        shell.stdout.string.should =~ /clouds/
      end
    end
  end
end
