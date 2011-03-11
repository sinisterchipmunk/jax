require 'spec_helper'
require 'stringio'

describe Jax::Routes do
  before(:each) { @out = ""; @io = StringIO.new(@out) }
  
  it "should map root" do
    subject.root "welcome"
    subject.compile(@io)
    @out.strip.should == 'Jax.routes.root(WelcomeController, "index");'
  end
  
  it "should map" do
    subject.map "path/to", "welcome"
    subject.compile(@io)
    @out.strip.should == 'Jax.routes.map("path/to", WelcomeController, "index");'
  end

  it "should map with action name" do
    subject.map "path/to", "welcome", "another"
    subject.compile(@io)
    @out.strip.should == 'Jax.routes.map("path/to", WelcomeController, "another");'
  end
end