require 'spec_helper'

describe 'jax:helper' do
  with_args 'user_input' do
    it "should generate Coffee helper" do
      subject.should generate("app/assets/jax/helpers/user_input_helper.js.coffee")
    end
  
    it "should generate Coffee spec" do
      subject.should generate("spec/javascripts/jax/helpers/user_input_helper_spec.js.coffee")
    end
  end

  with_args "user_input", "--without-coffeescript" do
    it "should generate JS helper" do
      subject.should generate("app/assets/jax/helpers/user_input_helper.js")
    end
  
    it "should generate JS spec" do
      subject.should generate("spec/javascripts/jax/helpers/user_input_helper_spec.js")
    end
  end
end
