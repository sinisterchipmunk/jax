require 'spec_helper'

describe 'jax:scaffold' do
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
      subject.should generate("app/assets/jax/resources/dungeons/default.resource")
    end
    
    it "should generate dungeon material" do
      subject.should generate("app/assets/jax/resources/materials/dungeon.resource")
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
