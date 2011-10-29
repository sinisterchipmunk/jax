# This spec tests the Jax::Shader preprocessor. For now, the preprocessor is in charge of handling standard
# Sprockets JS directives (as it inherits from Sprockets::DirectiveProcessor), as well as preprocessing the
# shader itself. For now, only `export` commands are processed. The rest of the preprocessing is currently
# done on the JavaScript side.
#

require 'spec_helper'

describe Jax::Shader do
  # include MockAssets
  
  context "exports" do
    context "with implicit value" do
      before :each do
        create_shader 'my_own_shader', :fragment => "void main(void) { vec4 ambient = vec4(1); export(vec4, ambient); }"
      end
      
      it "should produce an exports assignment" do
        asset('shaders/my_own_shader/fragment.glsl').should =~ /Jax\.shader_data\("my_own_shader"\)\["exports"\]\s*=/
      end
      
      it "should have 'ambient' in exports list" do
        asset('shaders/my_own_shader/fragment.glsl').should =~ /\["exports"\]\["ambient"\]\s*=\s*"vec4"/
      end
    end
    
    context "with explicit value" do
      before :each do
        create_shader 'my_own_shader', :fragment => "void main(void) { vec4 ambient = vec4(1); export(vec4, ambient, ambient * 0.5); }"
      end

      it "should produce an exports assignment" do
        asset('shaders/my_own_shader/fragment.glsl').should =~ /Jax\.shader_data\("my_own_shader"\)\["exports"\]\s*=/
      end
      
      it "should have 'ambient' in exports list" do
        asset('shaders/my_own_shader/fragment.glsl').should =~ /\["exports"\]\["ambient"\]\s*=\s*"vec4"/
      end
    end
  end
  
  context "requiring another shader library" do
    before :each do
      create_asset 'shaders/functions/lights.glsl', '1'
      create_shader 'my_own_shader', :common => "//= require 'shaders/functions/lights'\n2"
    end
    
    it "should set the shader data" do
      asset('shaders/my_own_shader/common.glsl').should =~ /Jax\.shader_data\("my_own_shader"\)\["common"\]\s*=/
    end
    
    it "should include a reference to required library but not the library's source itself" do
      # This approach saves significantly on space, cutting down the amount of JavaScript to be generated.
      asset('shaders/my_own_shader/common.glsl').should match(/#{Regexp::escape("<%= Jax.import_shader_code(\\\"functions\\\", \\\"lights\\\") %>\\n2")}/)
    end
    
    context "twice" do
      before :each do
        create_shader 'my_own_shader', :common => "//= require 'shaders/functions/lights'\n//= require 'shaders/functions/lights'\n2"
      end

      it "should not reference libraries more than once" do
        asset('shaders/my_own_shader/common.glsl').scan(/#{Regexp::escape("<%= Jax.import_shader_code(\\\"functions\\\", \\\"lights\\\") %>")}/).length.should == 1
      end
    end
  end
end
