require 'spec_helper'

pwd = File.join(Dir.pwd, "generator_tests")

describe Jax::Generators::LightSource::LightSourceGenerator do
  def generate(*args)
    Jax::Generators::LightSource::LightSourceGenerator.start(args, :shell => shell)
  end
  
  def shell
    @shell ||= SpecShell.new
  end

  before :each do
    FileUtils.rm_rf pwd
    Dir.chdir File.expand_path('..', pwd)
    FileUtils.mkdir_p pwd
    Dir.chdir pwd
    Jax::Generators::App::AppGenerator.start(["test_app"], :shell => shell)
    Dir.chdir File.join(pwd, "test_app")
  end

  after :each do
    FileUtils.rm_rf pwd
    Dir.chdir File.expand_path('..', pwd)
  end

  context "with light name" do
    before(:each) { generate 'torch' }

    it "should generate resource file" do
      File.should exist("app/resources/light_sources/torch.yml")
    end
  end
  
  context "with directional" do
    before(:each) { generate 'torch', 'directional' }
    
    it "should not include position" do
      File.read("app/resources/light_sources/torch.yml").should_not =~ /position/
    end
  end

  context "with point" do
    before(:each) { generate 'torch', 'point' }
    
    it "should not include direction" do
      File.read("app/resources/light_sources/torch.yml").should_not =~ /direction/
    end
  end
end
