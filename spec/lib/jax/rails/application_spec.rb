require 'spec_helper'

# Tests Rails app mounted by the command `jax server`. See Jax::Rails::Application.
# The app does nothing except mount Jax::Engine at "/".

describe "Jax::Rails::Application" do
  it "should mount Jax dev suite at root" do
    req = Rack::MockRequest.env_for("/")
    res = Jax::Rails::Application.call(req)
    body = res.last.inject("") { |body,chunk| body + chunk }
    (body =~ /Jax Development Suite/).should be_true
  end
end
