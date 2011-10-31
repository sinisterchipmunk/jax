require 'spec_helper'
require 'generators/jax/all'

describe Jax::Plugin::Credentials do
  def shell
    @shell ||= GenSpec::Shell.new
  end
  
  subject do
    Jax::Plugin::Credentials.new :home => local("."), :shell => shell
  end
  
  it "with new account" do
    shell.input.stub!(:gets).and_return 'missing@gmail.com', 'password', 'password'
    subject.api_key.should == "WXTzIXC2ODdbLAyvVL9p"
  end
  
  it "with missing config file and valid existing credentials" do
    shell.input.stub!(:gets).and_return 'sinisterchipmunk@gmail.com', 'password'
    subject.api_key.should == "WXTzIXC2ODdbLAyvVL9p"
  end
  
  it "with missing config file and invalid credentials for an existing account" do
    shell.input.stub!(:gets).and_return 'missing@gmail.com', 'invalid'
    proc { subject.api_key }.should raise_error(RuntimeError)
  end
  
  it "with missing api key" do
    shell.input.stub!(:gets).and_return 'missing@gmail.com', 'password', 'password'
    subject.api_key
    shell.output.string.should =~ /email/i
  end
  
  it "with api key" do
    create_file(".jax") { |f| f.print 'api_key: "1234"' }
    subject.api_key.should == "1234"
  end
  
  it "default home" do
    Jax::Plugin::Credentials.new.home.should == Thor::Util.user_home
  end
  
  it "override home" do
    Jax::Plugin::Credentials.new(:home => ".").home.should == File.expand_path(".")
  end
end
