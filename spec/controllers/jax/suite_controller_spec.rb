require 'spec_helper'

describe Jax::SuiteController do
  describe "when asset concatenation is disabled" do
    before { Jax.config.concatenate_assets = false }
    after { Jax.reset_config! }

    it 'should include dependency assets' do
      get :specs, :format => :json
      index = JSON.parse(response.body)
      index.should include('/assets/dependency.js?body=1')
    end
  end

  describe "when asset concatenation is enabled" do
    before { Jax.config.concatenate_assets = true }
    after { Jax.reset_config! }

    it 'should not include dependency assets' do
      get :specs, :format => :json
      index = JSON.parse(response.body)
      index.should_not include('/assets/dependency.js?body=1')
    end

    it 'should not include debug flag in paths' do
      get :specs, :format => :json
      index = JSON.parse(response.body)
      index.should include('/assets/application.js')
    end
  end
end
