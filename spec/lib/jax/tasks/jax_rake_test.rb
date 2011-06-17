require 'test_helper'
require 'test_app'

class Jax::RakeTasksTest < Rails::Generators::TestCase#ActiveSupport::TestCase
  # PWD = File.join(Dir.pwd, "generator_tests")
  PWD = File.expand_path("../../../../tmp/generator_tests/test_app", File.dirname(__FILE__))
  self.destination_root = PWD
  
  def shell
    @shell ||= SpecShell.new
  end
  
  def rake(args)
    output = `bundle exec rake #{args} 2>&1`
    if !$?.success?
      raise output
    end
  end

  # TODO clean this up
  setup do
    FileUtils.rm_rf PWD
    FileUtils.mkdir_p File.dirname(PWD) unless File.exist?(File.dirname(PWD))
    Dir.chdir File.expand_path('..', PWD)
    FileUtils.mkdir_p PWD
    Dir.chdir File.dirname(PWD)
    Jax::Generators::App::AppGenerator.start(["test_app"], :shell => shell)
    Dir.chdir PWD
    File.open("Gemfile", "w") { |f| f.print "gem 'jax', :path => '#{File.expand_path('../../../', PWD)}'"}
    `bundle install`
    Jax::Generators::Controller::ControllerGenerator.start(['welcome', 'index'], :shell => shell)
    File.open("config/routes.rb", "w") do |f|
      f.puts "TestApp.routes.map do\n  root 'welcome'\nmap 'another/index'\nend"
    end
    FileUtils.mkdir_p "public/images"
    FileUtils.touch "public/images/test.png"
  end

  teardown do
    FileUtils.rm_rf PWD
    Dir.chdir File.expand_path('..', PWD)
  end
  
  test "jax:generate_files" do
    rake('jax:generate_files')
    
    assert_match /jax:update/, File.read(File.expand_path('tmp/version_check.js'))
  end
  
  test "jax:package" do
    rake('jax:package')

    subject = File.read(File.expand_path('pkg/javascripts/test_app.js'))
    
    # should install assets
    assert_file 'pkg/images/test.png'
    
    assert_file 'pkg/javascripts/test_app.js' do |app|
      # should not do a version check
      assert_no_match /jax:update/, app
      # should contain views
      assert_match /Jax.views.push\('welcome\/index'/, app
      # should contain welcome controller
      assert_match /var WelcomeController = /, app
      # should contain application controller
      assert_match /var ApplicationController = /, app
      # should contain welcome helper
      assert_match /var WelcomeHelper = /, app
      # should contain application helper
      assert_match /var ApplicationHelper = /, app
      # should contain routes
      assert_match /#{Regexp::escape 'Jax.routes.root(WelcomeController, "index")'}/, app
      # should not contain ruby package names
      assert_match /#{Regexp::escape 'Jax.routes.map("another/index", AnotherController, "index")'}/, app
    end
  end
end
