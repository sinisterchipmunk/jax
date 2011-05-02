require 'spec_helper'

describe Jax::Shader do
  subject { Jax::Shader.new("path/to/shader") }
  
  it "should set name" do
    subject.name.should == "shader"
  end
  
  it "should set path" do
    subject.path.should == "path/to"  
  end
  
  context "with an export" do
    before(:each) { subject.fragment = "void main(void)\n{\n  vec4 ambient;\n  export(vec4, ambient, ambient);\n}" }
    
    it "should NOT produce global variable declaration because that's done in JS" do
      # This has to be done in JS because we can't possibly avoid variable redefinitions at this stage
      # it's this or have broken shader chains whenever two shaders happen to export the same variable
      subject.to_s.should_not =~ /vec4 _shader_ambient;/
    end
#    it "should produce global variable declaration" do
#      subject.to_s.should =~ /vec4 _shader_ambient;/
#    end
    
    # moved to JS for greater flexibility -- doing it here we can't adjust for shader chains
#    it "should produce global variable assignment" do
#      subject.to_s.should =~ /_shader_ambient = ambient;/
#    end
    
    it "should save exports to js" do
      subject.to_s.should =~ /exports: \{['"]ambient['"]:\s*['"]vec4['"]\},/
    end
  end
  
  context "with conflicting export values" do
    before(:each) { subject.fragment = "void main(void) { export(vec4, ambient, one); export(vec4, ambient, two); }" }
    
#    it "should not have two exports" do
#      subject.to_s.should_not =~ /vec4 _shader_ambient.*vec4 _shader_ambient/
#    end
  end
  
  context "with an import" do
    before(:each) { subject.fragment = "void main(void)\n{\n  vec4 a = import(ambient);\n}" }
    
    it "should NOT produce global variable reference because that's done in JS" do
      # This has to be done in JavaScript because we can't possibly know the exports of other shaders at this stage...
      # it's this or have broken shader chains whenever they're not used in an expected order
      subject.to_s.should_not =~ /_shader_ambient/
    end
    
#    it "should produce global variable reference" do
#      subject.to_s.should =~ /vec4 a = _shader_ambient;/
#    end
  end
end