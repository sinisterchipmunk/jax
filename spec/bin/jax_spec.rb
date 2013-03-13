require 'spec_helper'

base_dir = File.expand_path '../..', File.dirname(__FILE__)

class AppFailure < RuntimeError
end

describe 'bin/jax' do
  before :each do
    FileUtils.rm_rf File.join(base_dir, "tmp/jax-bin")
    FileUtils.mkdir_p File.join(base_dir, "tmp/jax-bin")
    FileUtils.chdir File.join(base_dir, "tmp/jax-bin")
    @args = []
  end
  
  after :each do
    FileUtils.rm_rf File.join(base_dir, "tmp/jax-bin")
    FileUtils.chdir base_dir
  end

  subject do
    jax = File.join base_dir, "bin/jax"
    result = %x[#{jax} #{@args.join(' ')} 2>&1]
    if $?.success?
      result
    else
      raise AppFailure, result
    end
  end
  
  def subject_with_rescue
    @subject ||= subject
  rescue AppFailure => err
    @subject = err.message
  end
  
  describe "in a rails application" do
    before :each do
      FileUtils.mkdir_p "script"
      FileUtils.mkdir_p "config"
      File.open "config/routes.rb", "w" do |f|
      end
      
      File.open "config/application.rb", "w" do |f|
        f.puts "require 'rails/all'"
        f.puts "class TmpApp < Rails::Application"
        f.puts "  config.active_support.deprecation = :log"
        f.puts "  config.root = File.expand_path('../..', __FILE__)"
        f.puts "end"
      end
      File.open "config/environment.rb", "w" do |f|
        f.puts "require File.expand_path('application', File.dirname(__FILE__))"
        f.puts "::Rails.application.initialize!"
      end
      File.open "script/rails", "w" do |f|
        f.puts "APP_PATH = File.expand_path('../../config/application',  __FILE__)"
        f.puts "require 'rails/commands'"
      end
    end
    
    shared_examples_for 'rails app' do
      it "should invoke installer" do
        @args.push "install"
        subject.should =~ /mount Jax::Engine/
      end
      
      it "should give usage" do
        subject_with_rescue.should =~ /Usage:/
      end
      
      it "should invoke `rails g jax` generator" do
        @args.push "generate"
        subject_with_rescue.should =~ /You can invoke the following Jax generators:/
        subject_with_rescue.should =~ /rails generate jax:controller/
      end
    end
    
    it "should revoke generators with destroy" do
      @args.push "destroy", "controller", "welcome"
      subject.should     match(/remove/)
      subject.should_not match(/app\/views\/jax\/welcome/)
      subject.should     match(/app\/assets\/jax\/controllers\/welcome_controller.js.coffee/)
    end
    
    it_should_behave_like 'rails app'
    
    describe "subdirectory" do
      before :each do
        FileUtils.chdir "script"
      end
      
      it_should_behave_like 'rails app'
    end
  end
  
  describe "in a spaced jax app" do
    let(:shell) { GenSpec::Shell.new }
    
    before do
      Jax::Generators::ApplicationGenerator.start ["spaced app", "--skip-bundle"], :shell => shell
      FileUtils.chdir "spaced app"
    end
    
    it "should not fail to generate" do
      proc { subject }.should_not raise_error
    end
  end
  
  describe "in a jax application" do
    before(:each) do
      Jax::Generators::ApplicationGenerator.start ["test_app", "--skip-bundle"], :shell => GenSpec::Shell.new
      FileUtils.chdir "test_app"
    end
    
    shared_examples_for 'jax app' do
      it "should give usage" do
        subject_with_rescue.should =~ /Usage:/
      end
      
      it "should invoke `jax g` generator" do
        @args.push "generate"
        subject_with_rescue.should =~ /You can invoke the following Jax generators:/
        subject_with_rescue.should =~ /jax generate controller/
      end
    end
    
    it "should revoke generators with destroy" do
      @args.push "destroy", "controller", "welcome"
      subject.should     match(/remove/)
      subject.should_not match(/app\/views\/jax\/welcome/)
      subject.should     match(/app\/assets\/jax\/controllers\/welcome_controller.js.coffee/)
    end
    
    it_should_behave_like 'jax app'
    
    describe "subdirectory" do
      before :each do
        FileUtils.chdir "script"
      end
      
      it_should_behave_like 'jax app'
    end
  end
  
  describe 'not in any application' do
    describe "creating a new jax app" do
      before :each do
        @args << 'new' << 'testapp' << '--skip-bundle'
      end
      
      it "should create a new jax application" do
        subject.should_not =~ /Not in a Jax or Rails application\./
        subject.should =~ /create(\e\[0m|)\s*testapp/
      end
    end
    
    it "should output a friendly help message" do
      subject_with_rescue.should =~ /Not in a Jax or Rails application\./
    end
  end
end
