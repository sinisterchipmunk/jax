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
  
  with_args "user_input_helper" do
    it "should generate 'user_input_helper' and not 'user_input_helper_helper'" do
      subject.should generate("app/assets/jax/helpers/user_input_helper.js.coffee") { |c|
        c.should     match(/UserInputHelper/)
        c.should_not match(/UserInputHelperHelper/)
      }
      subject.should generate("spec/javascripts/jax/helpers/user_input_helper_spec.js.coffee") { |c|
        c.should     match(/UserInputHelper/)
        c.should_not match(/UserInputHelperHelper/)
      }

      subject.should_not generate("app/assets/jax/helpers/user_input_helper_helper.js.coffee")
      subject.should_not generate("spec/javascripts/jax/helpers/user_input_helper_helper_spec.js.coffee")
    end
    
    with_args "--without-coffeescript" do
      it "should generate 'user_input_helper' and not 'user_input_helper_helper'" do
        subject.should generate("app/assets/jax/helpers/user_input_helper.js") { |c|
          c.should     match(/UserInputHelper/)
          c.should_not match(/UserInputHelperHelper/)
        }
        subject.should generate("spec/javascripts/jax/helpers/user_input_helper_spec.js") { |c|
          c.should     match(/UserInputHelper/)
          c.should_not match(/UserInputHelperHelper/)
        }

        subject.should_not generate("app/assets/jax/helpers/user_input_helper_helper.js")
        subject.should_not generate("spec/javascripts/jax/helpers/user_input_helper_helper_spec.js")
      end
    end
  end
end
