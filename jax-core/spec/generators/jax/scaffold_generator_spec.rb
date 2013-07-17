require 'spec_helper'

describe 'jax:scaffold' do
  with_args "test_breaker" do
    it "should camelize model name" do
      subject.should generate("app/assets/jax/models/test_breaker.js.coffee") { |f|
        f.should =~ /TestBreaker/
      }
    end
    
    it "should camelize controller name" do
      subject.should generate("app/assets/jax/controllers/test_breaker_controller.js.coffee") { |f|
        f.should =~ /TestBreaker/
      }
    end
    
    it "should camelize names in controller spec" do
      subject.should generate("spec/javascripts/jax/controllers/test_breaker_controller_spec.js.coffee") { |f|
        f.should =~ /describe "TestBreakerController"/
        f.should =~ /redirectTo "test_breaker/
      }
    end
  end
  
  with_args "dungeon" do
    it "should generate dungeon model" do
      subject.should generate("app/assets/jax/models/dungeon.js.coffee")
      subject.should generate("spec/javascripts/jax/models/dungeon_spec.js.coffee")
    end

    it "should generate dungeon controller" do
      subject.should generate("app/assets/jax/controllers/dungeon_controller.js.coffee")
      subject.should generate("spec/javascripts/jax/controllers/dungeon_controller_spec.js.coffee")
    end
    
    it "should generate default dungeon resource" do
      subject.should generate("app/assets/jax/resources/dungeons/default.js.coffee")
    end
    
    it "should generate dungeon material" do
      subject.should generate("app/assets/jax/resources/materials/dungeon.js.coffee")
    end
    
    with_args "--without-coffeescript" do
      it "should generate dungeon model" do
        subject.should generate("app/assets/jax/models/dungeon.js")
        subject.should generate("spec/javascripts/jax/models/dungeon_spec.js")
      end

      it "should generate dungeon controller" do
        subject.should generate("app/assets/jax/controllers/dungeon_controller.js")
        subject.should generate("spec/javascripts/jax/controllers/dungeon_controller_spec.js")
      end
    end
  end
end
