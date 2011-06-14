require 'spec_helper'

pwd = File.join(Dir.pwd, "generator_tests")

describe Jax::Generators::Plugin::PluginGenerator do
  def shell
    @shell ||= SpecShell.new
  end
  
  def generator
    Jax::Generators::Plugin::PluginGenerator
  end
  
  def generate(*args)
    generator.start(args + ['--debug'], :shell => shell)
  rescue SystemExit
    # do nothing, because this is OK
  end
  
  def path(relative)
    File.join(Dir.pwd, relative)
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
  
  context "a clean new plugin" do
    before(:each) do
      generate "cloud"
    end
    
    it "should create install.rb" do
      File.should be_file(path 'vendor/plugins/cloud/install.rb')
    end

    it "should create uninstall.rb" do
      File.should be_file(path 'vendor/plugins/cloud/uninstall.rb')
    end
    
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
  
  context "using a locally conflicting name" do
    before(:each) do
      generate "cloud"
      shell.clear
      File.open(path("vendor/plugins/cloud/custom"), "w") { |f| f.print "file contents" }
    end
    
    context "and approving overwrite" do
      before(:each) do
        shell.stdin.should_receive(:gets).and_return("y\n")
        generate 'cloud'
      end
      
      it "should delete original contents" do
        File.should_not exist(path('vendor/plugins/cloud/custom'))
      end
      
      it "should generate plugin directory" do
        File.should be_directory(path('vendor/plugins/cloud'))
      end
    end
  end
  
  context "using a conflicting name with --local" do
    before(:each) { generate "clouds", "--local" }
    
    it "should not abort" do
      shell.stdout.string.should_not =~ /aborted/
    end
    
    it "should generate plugin directory" do
      File.should exist(path 'vendor/plugins/clouds')
    end
  end
  
  context "not finding remote name conflicts" do
    before(:each) { generate "cloud" }
    
    it "should not abort" do
      shell.stdout.string.should_not =~ /aborted/
    end
    
    it "should generate plugin directory" do
      File.should exist(path 'vendor/plugins/cloud')
    end
  end
  
  context "finding remote name conflicts" do
    context "when aborted" do
      before(:each) do
        shell.stdin.should_receive(:gets).and_return("n\n")
        generate "clouds"
      end
      
      it "should not generate plugin directory" do
        File.should_not be_directory(path 'vendor/plugins/clouds')
      end
      
      it "should output 'aborted'" do
        shell.stdout.string.should =~ /aborted/
      end
    end

    context "when confirmed" do
      before(:each) do
        shell.stdin.should_receive(:gets).and_return("y\n")
        generate "clouds"
      end
      
      it "should not generate plugin directory" do
        File.should be_directory(path 'vendor/plugins/clouds')
      end
      
      it "should output 'aborted'" do
        shell.stdout.string.should_not =~ /aborted/
      end
    end
  end
end
