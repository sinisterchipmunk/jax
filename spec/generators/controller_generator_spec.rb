require 'spec_helper'

pwd = File.join(Dir.pwd, "generator_tests")

describe Jax::Generators::Controller::ControllerGenerator do
  def generate(*args)
    Jax::Generators::Controller::ControllerGenerator.start(args, :shell => SpecShell.new)
  end

  before :each do
    FileUtils.rm_rf pwd
    Dir.chdir File.expand_path('..', pwd)
    FileUtils.mkdir_p pwd
    Dir.chdir pwd
    Jax::Generators::App::AppGenerator.start(["test_app"], :shell => SpecShell.new)
    Dir.chdir File.join(pwd, "test_app")
  end

  after :each do
    FileUtils.rm_rf pwd
    Dir.chdir File.expand_path('..', pwd)
  end

  it "should generate controller source file" do
    generate "welcome"
    File.should exist("app/controllers/welcome_controller.js")
  end
end
