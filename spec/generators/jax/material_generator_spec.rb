require 'spec_helper'

describe 'jax:material' do
  with_args "brick" do
    it "should generate brick material" do
      subject.should generate("app/assets/jax/resources/materials/brick.resource")
    end
    
    with_args "normalMap", "--append" do
      before_generation do
        FileUtils.mkdir_p "app/assets/jax/resources/materials"
        File.open("app/assets/jax/resources/materials/brick.resource", "w") { |f| f.puts '###' }
      end
      
      it "should add normalmap without replacing original copy" do
        subject.should generate("app/assets/jax/resources/materials/brick.resource") { |content|
          content.lines.first.strip.should == '###'
          content.should =~ /type: NormalMap/
        }
      end
    end
  end
end
