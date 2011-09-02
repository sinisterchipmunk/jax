require 'spec_helper'
require 'action_view'

describe "Jax gem assets:" do
  before(:each) { app.load! }
  
  it "should find jax.js" do
    app.get('/assets/jax.js').body.should match("Jax =")
  end
  
  it "should mount test suite app" do
    app.get('/jax').body.should match("Jax Test Suite")
  end
end
