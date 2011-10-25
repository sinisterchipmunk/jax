require 'spec_helper'
require 'fileutils'

describe "jax" do
  before_generation do
    FileUtils.mkdir_p "config"
    File.open("config/routes.rb", "w") do |f|
      f.puts "Rails.application.routes.draw do"
      f.puts "end"
    end
  end
  
  it "should output generator list" do
    subject.should output("controller")
    subject.should output("helper")
    subject.should output("install")
    subject.should output("light")
    subject.should output("model")
    subject.should output("shader")
  end
end
