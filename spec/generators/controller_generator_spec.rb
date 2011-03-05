require 'spec_helper'

pwd = File.join(Dir.pwd, "generator_tests")

describe Jax::Generators::Controller::ControllerGenerator do
  def generate(*args)
    Jax::Generators::Controller::ControllerGenerator.start(args, :shell => shell)
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

  context "generating a welcome controller with no arguments" do
    before(:each) { generate 'welcome' }

    it "should generate controller source file" do
      File.should exist("app/controllers/welcome_controller.js")
    end
  
    it "should use controller class name" do
      File.read(File.expand_path("test_app/app/controllers/welcome_controller.js", pwd)).lines.first.
              should =~ /WelcomeController/
    end
  
    it "should generate controller helper file" do
      File.should exist('app/helpers/welcome_helper.js')
    end
  
    it "should generate controller test file" do
      File.should exist('spec/javascripts/controllers/welcome_controller_spec.js')
    end
  end
end
