require 'spec_helper'

# Tests Rails app mounted by the command `jax server`. See Jax::Rails::Application.
# The app does nothing except mount Jax::Engine at "/".

describe "Jax::Rails::Application" do
  it "should mount Jax dev suite at root" do
    # require 'jax/rails/application'
    # Jax::Rails::Application.initialize!

    req = Rack::MockRequest.env_for("/")
    res = Jax::Rails::Application.call(req)
    body = res.last.inject("") { |body,chunk| body + chunk }
    # body.should match("Jax Development Suite")
    (body =~ /Jax Development Suite/).should be_true
  end
end
