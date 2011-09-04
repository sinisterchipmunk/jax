require 'spec_helper'

# Tests the Jax development suite, which is mounted via Jax::Engine. Since
# most of this is tested via Cucumber, the rspec test mostly just verifies that Jax::Engine
# can be mounted into a generic Rails app and that it produces the Jax development suite.

describe Jax::Engine do
  xit "should mount Jax dev suite at root" do
    require 'action_controller/railtie'

    $app = Class.new(Rails::Application) do
      config.secret_token                      = "e10adc3949ba59abbe56e057f20f883e"
      config.session_store :cookie_store, :key => "_jax_session"
      config.active_support.deprecation        = :log
    end
    
    $app.initialize!
    
    $app.routes.draw { mount Jax::Engine => "/" }

    req = Rack::MockRequest.env_for("/")
    res = $app.call(req)
    body = res.last.inject("") { |body,chunk| body + chunk }
    # body.should match("Jax Development Suite")
    (body =~ /Jax Development Suite/).should be_true
  end
end
