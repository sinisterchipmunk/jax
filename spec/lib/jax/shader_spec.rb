# This spec tests the Jax::Shader preprocessor. For now, the preprocessor is in charge of handling standard
# Sprockets JS directives (as it inherits from Sprockets::DirectiveProcessor), as well as preprocessing the
# shader itself. For now, only `export` commands are processed. The rest of the preprocessing is currently
# done on the JavaScript side.
#

require 'spec_helper'

# describe Jax::Shader do
#   # include MockAssets
  
#   context "directory but shader files missing" do
#     before do
#       create_directory 'app/assets/jax/shaders/my_shader'
#       create_shader 'another_shader', :fragment => '1'
#       create_asset 'all_shaders.js', '//= require_everything_matching "shaders"'
#     end
    
#     it "should not produce a shader at all" do
#       proc { asset('shaders/my_shader/fragment.glsl') }.should raise_error(/asset not found/)
#       proc { asset('shaders/my_shader/vertex.glsl') }.should raise_error(/asset not found/)
#       proc { asset('shaders/my_shader/manifest.js') }.should raise_error(/asset not found/)
#     end
    
#     it "should not build the shader at all" do
#       appjs = asset('all_shaders.js')
      
#       appjs.should =~ /another_shader/ # sanity check
#       appjs.should_not =~ /my_shader/
#       appjs.should_not =~ /MyShader/
#     end
#   end
  
#   context "exports" do
#     context "with implicit value" do
#       before :each do
#         create_shader 'my_own_shader', :fragment => "void main(void) { vec4 ambient = vec4(1); export(vec4, ambient); }"
#       end
      
#       it "should produce an exports assignment" do
#         asset('shaders/my_own_shader/fragment.glsl').should =~ /Jax\.shader_data\("my_own_shader"\)\["exports"\]\s*=/
#       end
      
#       it "should have 'ambient' in exports list" do
#         asset('shaders/my_own_shader/fragment.glsl').should =~ /\["exports"\]\["ambient"\]\s*=\s*"vec4"/
#       end
#     end
    
#     context "with explicit value" do
#       before :each do
#         create_shader 'my_own_shader', :fragment => "void main(void) { vec4 ambient = vec4(1); export(vec4, ambient, ambient * 0.5); }"
#       end

#       it "should produce an exports assignment" do
#         asset('shaders/my_own_shader/fragment.glsl').should =~ /Jax\.shader_data\("my_own_shader"\)\["exports"\]\s*=/
#       end
      
#       it "should have 'ambient' in exports list" do
#         asset('shaders/my_own_shader/fragment.glsl').should =~ /\["exports"\]\["ambient"\]\s*=\s*"vec4"/
#       end
#     end
#   end
  
#   context "requiring another shader library" do
#     before :each do
#       create_asset 'shaders/functions/lights.glsl', '1'
#       create_shader 'my_own_shader', :common => "//= require 'shaders/functions/lights'\n2"
#     end
    
#     it "should set the shader data" do
#       asset('shaders/my_own_shader/common.glsl').should =~ /Jax\.shader_data\("my_own_shader"\)\["common"\]\s*=/
#     end
    
#     it "should include a reference to required library but not the library's source itself" do
#       # This approach saves significantly on space, cutting down the amount of JavaScript to be generated.
#       asset('shaders/my_own_shader/common.glsl').should match(/#{Regexp::escape("<%= Jax.import_shader_code(\\\"functions\\\", \\\"lights\\\") %>\\n2")}/)
#     end
    
#     context "twice" do
#       before :each do
#         create_shader 'my_own_shader', :common => "//= require 'shaders/functions/lights'\n//= require 'shaders/functions/lights'\n2"
#       end

#       it "should not reference libraries more than once" do
#         asset('shaders/my_own_shader/common.glsl').scan(/#{Regexp::escape("<%= Jax.import_shader_code(\\\"functions\\\", \\\"lights\\\") %>")}/).length.should == 1
#       end
#     end
#   end
# end
