require 'test_helper'

class Jax::ShaderTest < ActiveSupport::TestCase
  def subject
    @subject ||= Jax::Shader.new("path/to/shader")
  end
  
  test "subject properties" do
    assert_equal "shader", subject.name
    assert_equal "path/to/shader", subject.path
  end
  
  test "with an export" do
    subject.fragment = "void main(void)\n{\n  vec4 ambient;\n  export(vec4, ambient, ambient);\n}"
    
    # This has to be done in JS because we can't possibly avoid variable redefinitions at this stage
    # it's this or have broken shader chains whenever two shaders happen to export the same variable
    assert_no_match(/vec4 _shader_ambient;/, subject.to_s)
    assert_match /exports: \{['"]ambient['"]:\s*['"]vec4['"]\},/, subject.to_s
  end
  
  test "with an import" do
    subject.fragment = "void main(void)\n{\n  vec4 a = import(ambient);\n}"
    
    # This has to be done in JavaScript because we can't possibly know the exports of other shaders at this stage...
    # it's this or have broken shader chains whenever they're not used in an expected order
    assert_no_match(/_shader_ambient/, subject.to_s)
  end
end
