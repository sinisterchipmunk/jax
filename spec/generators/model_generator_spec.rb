require 'spec_helper'

pwd = File.join(Dir.pwd, "generator_tests")

describe Jax::Generators::Model::ModelGenerator do
  def generate(*args)
    Jax::Generators::Model::ModelGenerator.start(args, :shell => shell)
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

  context "with no arguments" do
    before(:each) { generate 'character' }

    it "should generate model source file" do
      File.should exist("app/models/character.js")
    end
    
    it "should generate model test file" do
      File.should exist("spec/javascripts/models/character_spec.js")
    end
    
    it "should generate resources directory" do
      File.should exist("app/resources/characters")
    end
  end
end
