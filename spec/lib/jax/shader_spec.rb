# Shaders are included into a Jax project when any JavaScript file includes preprocessor directives such as:
#   //= require_all_shaders
#
# Jax::ShaderProcessor receives this directive and converts it to requests for the various shaders, themselves.
# Shader files are structured like so:
#
#   app/assets/javascripts/shaders/[shader_name]/common.glsl
#   app/assets/javascripts/shaders/[shader_name]/vertex.glsl
#   app/assets/javascripts/shaders/[shader_name]/fragment.glsl
#   app/assets/javascripts/shaders/[shader_name]/material.js
#
# Note the .glsl file extensions, which have replaced the .ejs extensions from earlier versions of Jax.
#
# This structure may need to be changed. We should study the idea of adding `app/assets/shaders` to the
# Sprockets load path. This may help organize the app structure, since .glsl files are not really Javascripts.
#
#
# This spec tests the Jax::Shader preprocessor. For now, the preprocessor is in charge of handling standard
# Sprockets JS directives (as it inherits from Sprockets::DirectiveProcessor), as well as preprocessing the
# shader itself. For now, only `export` commands are processed. The rest of the preprocessing is currently
# done on the JavaScript side.
#

require 'spec_helper'

describe Jax::Shader do
  include MockAssets
  
  context "requiring another shader library" do
    before :each do
      create_asset 'shaders/functions/lights.glsl', '1'
      create_shader 'lighting', :common => "//= require 'shaders/functions/lights'\n//= require 'shaders/functions/lights'\n2"
    end
    
    it "should include a reference to required library but not the library's source itself" do
      # This approach saves significantly on space, cutting down the amount of JavaScript to be generated.
      asset('shaders/lighting/common.glsl').strip.should =~ /#{Regexp::escape "<%= Jax.shader_data(\\\"functions\\\")[\\\"lights\\\"] %>\\n2"}/
    end
    
    it "should not reference libraries more than once" do
      asset('shaders/lighting/common.glsl').strip.should_not =~ /#{Regexp::escape "<%= Jax.shader_data(\\\"functions\\\")[\\\"lights\\\"] %>\\n<%= Jax.shader_data(\\\"functions\\\")[\\\"lights\\\"] %>\\n2"}/
    end
  end
end
