require 'spec_helper'

describe 'jax:light' do
  with_args 'candle', 'point' do
    it "should generate a point light" do
      subject.should generate("app/assets/jax/resources/light_sources/candle.resource") { |c|
        c.should =~ /type: POINT_LIGHT/
      }
    end
  end

  with_args 'sun', 'directional' do
    it "should generate a point light" do
      subject.should generate("app/assets/jax/resources/light_sources/sun.resource") { |c|
        c.should =~ /type: DIRECTIONAL_LIGHT/
      }
    end
  end

  with_args 'flashlight', 'spot' do
    it "should generate a point light" do
      subject.should generate("app/assets/jax/resources/light_sources/flashlight.resource") { |c|
        c.should =~ /type: SPOT_LIGHT/
      }
    end
  end
end
