require 'spec_helper'

describe "jax:controller" do
  before_generation do
    FileUtils.mkdir_p "config"
    File.open("config/routes.rb", "w") do |f|
      f.puts "Rails.application.routes.draw do"
      f.puts "end"
    end
  end
  
  shared_examples_for "generator with coffee" do
    it "should generate coffee file" do
      subject.should generate("app/assets/jax/controllers/welcome_controller.js.coffee")
    end

    it "should generate coffee spec" do
      subject.should generate("spec/javascripts/jax/controllers/welcome_controller_spec.js.coffee")
    end
    
    it "should generate coffee view" do
      subject.should generate("app/assets/jax/views/welcome/index.js.coffee")
      subject.should generate("app/assets/jax/views/welcome/other.js.coffee")
    end
    
    it "should not generate JS file" do
      subject.should_not generate("app/assets/jax/controllers/welcome_controller.js")
    end
    
    it "should not generate JS spec" do
      subject.should_not generate("spec/javascripts/jax/controllers/welcome_controller_spec.js")
    end

    it "should not generate JS view" do
      subject.should_not generate("app/assets/jax/views/welcome/index.js")
      subject.should_not generate("app/assets/jax/views/welcome/other.js")
    end
  end
  
  shared_examples_for 'generator without coffee' do
    it "should not generate coffee file" do
      subject.should_not generate("app/assets/jax/controllers/welcome_controller.js.coffee")
    end

    it "should not generate coffee spec" do
      subject.should_not generate("spec/javascripts/jax/controllers/welcome_controller_spec.js.coffee")
    end
    
    it "should not generate coffee view" do
      subject.should_not generate("app/assets/jax/views/welcome/index.js.coffee")
      subject.should_not generate("app/assets/jax/views/welcome/other.js.coffee")
    end
    
    it "should generate JS file" do
      subject.should generate("app/assets/jax/controllers/welcome_controller.js")
    end
    
    it "should generate JS spec" do
      subject.should generate("spec/javascripts/jax/controllers/welcome_controller_spec.js")
    end

    it "should generate JS view" do
      subject.should generate("app/assets/jax/views/welcome/index.js")
      subject.should generate("app/assets/jax/views/welcome/other.js")
    end
  end

  # ===

  with_arguments 'welcome' do
    it "should generate a default index action" do
      subject.should generate("app/assets/jax/controllers/welcome_controller.js.coffee") { |c|
        c.should match(/\s+index:/)
      }
    end
  end

  with_arguments 'welcome', 'index', 'other' do
    it_should_behave_like "generator with coffee"
    
    it "should not generate Rails files" do
      subject.should_not generate("app/controllers/welcome_controller.rb")
    end
  end
  
  with_arguments 'welcome', 'index', 'other', '-j' do
    it_should_behave_like 'generator without coffee'
  end

  with_arguments 'welcome', 'index', 'other', '--without-coffeescript' do
    it_should_behave_like 'generator without coffee'
  end

  with_arguments 'welcome', 'index', 'other', '--rails' do
    it_should_behave_like "generator with coffee"
    
    it "should generate Rails files" do
      subject.should generate("app/controllers/welcome_controller.rb")
    end
  end
end
