require 'spec_helper'

base_dir = File.expand_path '../..', File.dirname(__FILE__)

describe 'bin/jax' do
  before :each do
    FileUtils.rm_rf File.join(base_dir, "tmp/jax-bin")
    FileUtils.mkdir_p File.join(base_dir, "tmp/jax-bin")
    FileUtils.chdir File.join(base_dir, "tmp/jax-bin")
    @args = []
  end
  
  subject do
    jax = File.join base_dir, "bin/jax"
    result = %x[#{jax} #{@args.join(' ')} 2>&1]
    if $?.success?
      result
    else
      raise result
    end
  end
  
  describe "in a rails application" do
    before :each do
      FileUtils.mkdir_p "script"
      FileUtils.mkdir_p "config"
      File.open "config/application.rb", "w" do |f|
        f.puts "require 'rails/all'"
        f.puts "class TmpApp < Rails::Application; end"
      end
      File.open "script/rails", "w" do |f|
        f.puts "APP_PATH = File.expand_path('../../config/application',  __FILE__)"
        f.puts "require 'rails/commands'"
      end
    end
    
    shared_examples_for 'rails app' do
      it "should give usage" do
        subject.should =~ /Usage:/
      end
      
      it "should invoke `rails g jax` generator" do
        @args.push "generate"
        subject.should =~ /You can invoke the following Jax generators:/
        subject.should =~ /rails generate jax:controller/
      end
    end
    
    it_should_behave_like 'rails app'
    
    describe "subdirectory" do
      before :each do
        FileUtils.chdir "script"
      end
      
      it_should_behave_like 'rails app'
    end
  end
  
  describe "in a jax application" do
    before(:each) do
      FileUtils.mkdir_p "script"
      FileUtils.touch "script/jax"
    end
    
    shared_examples_for 'jax app' do
      it "should give usage" do
        subject.should =~ /Usage:/
      end
      
      it "should invoke `jax g` generator" do
        @args.push "generate"
        subject.should =~ /You can invoke the following Jax generators:/
        subject.should =~ /jax generate controller/
      end
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
    it "should output a friendly help message" do
      subject.should =~ /Not in a Jax or Rails application\./
    end
  end
end
