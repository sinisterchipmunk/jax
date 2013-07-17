require 'spec_helper'

describe "jax:application" do
  with_args "welcome", "--skip-bundle" do
    it "should generate application controller" do
      subject.should generate("welcome/app/assets/jax/controllers/application_controller.js.coffee")
      subject.should_not generate("welcome/app/assets/jax/controllers/application_controller.js")
    end
    
    with_args "--without-coffeescript" do
      it "should generate application controller" do
        subject.should generate("welcome/app/assets/jax/controllers/application_controller.js")
        subject.should_not generate("welcome/app/assets/jax/controllers/application_controller.js.coffee")
      end
    end
  end
end
