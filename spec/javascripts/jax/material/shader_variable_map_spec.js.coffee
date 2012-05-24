describe "Jax.Material.ShaderVariableMap", ->
  map = null
  beforeEach -> map = new Jax.Material.ShaderVariableMap {a: "_a"}, {b: "_b"}
  
  it "should produce variable values for real shader names", ->
    map.set a: 1, b: 2
    expect(map.assigns).toEqual {_a: 1, _b: 2}
  
  it "should raise an error if assigning a variable that does not exist", ->
    expect(-> map.set c: 2).toThrow("Variable 'c' not found!")
    
  it "should not raise an error if assigning to a variable's real name", ->
    expect(-> map.set _a: 1).not.toThrow()
    
  it "should allow setting with two arguments", ->
    map.set 'a', 1
    expect(map.assigns._a).toEqual 1
    
  # describe "binding to webgl", ->
  #   beforeEach ->
  #     spyOn(SPEC_CONTEXT.gl, 'getUniformLocation').andReturn -1
  #   
  #   it "should apply the variable values", ->
  #     map.apply SPEC_CONTEXT
  #     