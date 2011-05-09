require 'spec_helper'

pwd = File.join(Dir.pwd, "generator_tests")

describe "Rake Tasks:" do
  def shell
    @shell ||= SpecShell.new
  end
  
  def rake(args)
    output = `bundle exec rake #{args} 2>&1`
    if !$?.success?
      raise output
    end
  end

  before :all do
    FileUtils.rm_rf pwd
    Dir.chdir File.expand_path('..', pwd)
    FileUtils.mkdir_p pwd
    Dir.chdir pwd
    Jax::Generators::App::AppGenerator.start(["test_app"], :shell => shell)
#    puts shell.output.string
    Dir.chdir File.join(pwd, "test_app")
    File.open("Gemfile", "w") { |f| f.print "gem 'jax', :path => '#{File.join(File.dirname(__FILE__), "../../../..")}'"}
    `bundle install`
    Jax::Generators::Controller::ControllerGenerator.start(['welcome', 'index'], :shell => shell)
    File.open("config/routes.rb", "w") do |f|
      f.puts "TestApp.routes.map do\n  root 'welcome'\nmap 'another/index'\nend"
    end
    FileUtils.mkdir_p "public/images"
    FileUtils.touch "public/images/test.png"
  end

  after :all do
    FileUtils.rm_rf pwd
    Dir.chdir File.expand_path('..', pwd)
  end
  
  context "jax:package" do
    before(:each) { rake('jax:package') }
    
    context "javascript" do
      subject { File.read(File.expand_path('pkg/javascripts/test_app.js')) }
      
      it "should install assets" do
        File.should exist('pkg/images/test.png')
      end
      
      it "should contain views" do
        subject.should =~ /Jax.views.push\('welcome\/index'/
      end
      
      it "should contain welcome controller" do
        subject.should =~ /var WelcomeController = /
      end
      
      it "should contain application controller" do
        subject.should =~ /var ApplicationController = /
      end
      
      it "should contain welcome helper" do
        subject.should =~ /var WelcomeHelper = /
      end
      
      it "should contain application helper" do
        subject.should =~ /var ApplicationHelper = /
      end
      
      it "should contain routes" do
        subject.should =~ /#{Regexp::escape 'Jax.routes.root(WelcomeController, "index")'}/
      end
      
      it "should not contain ruby package names" do
        subject.should =~ /#{Regexp::escape 'Jax.routes.map("another/index", AnotherController, "index")'}/
      end
    end
  end
end
