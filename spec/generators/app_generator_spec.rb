require 'spec_helper'

pwd = File.join(Dir.pwd, "generator_tests")
EXPECTED_FILES = %w(
  app/controllers/application_controller.js
  app/helpers/application_helper.js
  app/models/
  app/resources/
  app/views/
  config/application.rb
  config/routes.rb 
  config/boot.rb
  public/webgl_not_supported.html       
  script/jax
  spec/javascripts/support/jasmine.yml
  spec/javascripts/support/jasmine_runner.rb
  spec/javascripts/support/spec_layout.html.erb
  spec/javascripts/support/spec_helpers/jax_spec_helper.js
  Rakefile 
  Gemfile
)

describe Jax::Generators::App::AppGenerator do
  def generate(*args)
    Jax::Generators::App::AppGenerator.start(args + ['--debug'], :shell => SpecShell.new)
  end

  before :each do
    FileUtils.rm_rf pwd
    Dir.chdir File.expand_path('..', pwd)
    FileUtils.mkdir_p pwd
    Dir.chdir pwd
  end

  after :each do
    FileUtils.rm_rf pwd
    Dir.chdir File.expand_path('..', pwd)
  end

  EXPECTED_FILES.each do |file|
    it "should generate '#{file}'" do
      generate("test_app")
      File.should exist(File.expand_path(File.join("test_app", file), pwd))
    end
  end
end
