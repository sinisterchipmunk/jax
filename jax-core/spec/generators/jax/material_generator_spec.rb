require 'spec_helper'

describe 'jax:material' do
  before_generation do
    FileUtils.mkdir_p "app/assets/jax/resources/materials"
  end

  context "with an existing material manifest" do
    before :each do
      FileUtils.mkdir_p ::Rails.application.root.join("app/assets/jax/shaders/brick").to_s
      File.open ::Rails.application.root.join("app/assets/jax/shaders/brick/manifest.yml").to_s, "w" do |f|
        f.puts({ :description => "shader description" }.to_yaml)
      end
    end
    
    it "should list the shader and its description in output" do
      shell = ::GenSpec::Shell.new
      ::Rails::Generators.invoke("jax:material", [], :shell => shell)
      shell.stderr.string.should match(/brick/)
      shell.stderr.string.should match(/shader description/)
    end
  end
  
  with_args "brick" do
    it "should generate brick material" do
      subject.should generate("app/assets/jax/resources/materials/brick.js.coffee")
    end
    
    with_args "--append" do
      describe "with a missing file" do
        it "should add default lighting layers" do
          subject.should generate("app/assets/jax/resources/materials/brick.js.coffee") { |content|
            content.should =~ /LambertDiffuse/
            content.should =~ /PhongSpecular/
          }
        end
      end
      
      describe "with a pre-existing file" do
        before_generation do
          FileUtils.touch "app/assets/jax/resources/materials/brick.js.coffee"
        end
      
        it "should not add default lighting layer" do
          subject.should generate("app/assets/jax/resources/materials/brick.js.coffee") { |content|
            content.should_not =~ /Lighting/
            content.should_not =~ /LambertDiffuse/
            content.should_not =~ /PhongSpecular/
          }
        end
      end
    end
    
    with_args "normalMap" do
      it "should add a normal map layer" do
        subject.should generate("app/assets/jax/resources/materials/brick.js.coffee") { |content|
          content.should include_layer('NormalMap')
        }
      end

      with_args "--append" do
        before_generation do
          File.open("app/assets/jax/resources/materials/brick.js.coffee", "w") { |f| f.puts "layers: [\n]" }
        end
        
        it "should add normalmap without replacing original file" do
          subject.should generate("app/assets/jax/resources/materials/brick.js.coffee") { |content|
            content.should include_layer('NormalMap')
          }
        end
      end
    end
  end
end
