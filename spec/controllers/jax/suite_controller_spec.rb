require 'spec_helper'

describe Jax::SuiteController do
  it 'should include jasmine specs' do
    get :specs, :format => :json
    index = JSON.parse(response.body)
    index.should_not be_empty
  end
end
