describe "Jax.Shader", ->
  shader = null
  beforeEach -> shader = new Jax.Shader
  
  describe "multiple exports accross appends", ->
    beforeEach ->
      shader.append "void main(void) { export(float, x, 1.0); }"
      shader.append "void main(void) { export(float, x, 2.0); }"
    
    it "should be accumulated", ->
      sim = new ShaderScript.Simulator vertex: shader.toString()
      sim.start()
      expect(sim.state.variables.exported_x0.value).toEqual 1
      expect(sim.state.variables.exported_x1.value).toEqual 2
  
  describe "importing with no prior exports", ->
    beforeEach -> shader.append 'float s = 0; void main() { import(x, s += x); }'
    
    it "should be ignored", ->
      sim = new ShaderScript.Simulator vertex: shader.toString()
      sim.start()
      expect(sim.state.variables.s.value).toEqual 0
  
  describe "importing with prior exports", ->
    beforeEach -> shader.append 'float s = 0; void main() { export(float, x, 1.0); export(float, x, 2.0); import(x, s += x); }'

    it "should be accumulated", ->
      sim = new ShaderScript.Simulator vertex: shader.toString()
      sim.start()
      expect(sim.state.variables.s.value).toEqual 3

  it "should merge identical definitions from in more than one append", ->
    shader.append "int i;"
    shader.append "int i;"
    expect(shader.toString().indexOf("int i;")).toEqual shader.toString().lastIndexOf("int i;")
    
  describe "with multiple functions with params spanning multiple lines", ->
    # the white space formatting here is crucial!
    beforeEach -> shader.append """
    float calcAttenuation(in vec3 ecPosition3,
                          out vec3 lightDirection)
    {
    }

    void DirectionalLight(
                          )
    {
      return 1;
    }
    """
    
    it "should not omit curly braces from the function", ->
      expect(shader.toString()).toMatch /\{[\s\t\n]*return 1;[\s\t\n]*\}/
  
  describe "parsing cache directives", ->
    it "should parse array caches properly", ->
      shader.append "void main() { cache(float, len[2]) { len[0] = 1.0; len[1] = 2.0; } }"
      sim = new ShaderScript.Simulator vertex: shader.toString()
      sim.start()
      expect(sim.state.variables.len.value).toEqual [1, 2]
    
    it "should use only the first value", ->
      shader.append "void main() { cache(float, len) {\n  len = 2.0;\n} }"
      shader.append "void main() { cache(float, len) {\n  len = 1.0;\n} }"
      sim = new ShaderScript.Simulator
        vertex: shader.toString()
      sim.start()
      expect(sim.state.variables.len.value).toEqual 2.0
      
    it "should throw an error when caching differring types", ->
      shader.append "void main() { cache(float, len) {\n  len = 2.0;\n} }"
      expect(-> shader.append "void main() { cache(int, len) {\n  len = 1;\n} }").toThrow "Can't cache `len` as `int`: already cached it as `float`"
  
  it "should mangle references to mangled functions", ->
    shader.append "void mangleThis() { }\n\nvoid main() { mangleThis() }"
    expect(shader.toString()).not.toMatch /mangleThis\(/
  
  it "should not err on empty params", ->
    expect(-> shader.append "void main() { }").not.toThrow()
    
  
  describe "after appending source", ->
    map = null
    beforeEach ->
      map = shader.append """
      shared uniform mat4 mvMatrix;
      shared attribute vec4 position;
      shared varying vec3 vPosition;
      shared int myfunc(int x) { return x; }

      uniform mat4 pMatrix;
      attribute vec3 normal;
      varying vec3 vNormal;
      void main(void) { gl_Position = pMatrix * mvMatrix * vec4(position, 1); }

      vec4 _position;
      """
      
    describe "the return value", ->
      it "should map shared uniforms", ->
        expect(map.mvMatrix).toEqual('mvMatrix')
    
      it "should map shared attributes", ->
        expect(map.position).toEqual('position')

      it "should map shared varyings", ->
        expect(map.vPosition).toEqual('vPosition')
        
      it "should map shared functions", ->
        expect(map.myfunc).toEqual('myfunc')
    
      it "should map private uniforms", ->
        expect(map.pMatrix).toEqual('pMatrix0')

      it "should map private attributes", ->
        expect(map.normal).toEqual('normal0')

      it "should map private varyings", ->
        expect(map.vNormal).toEqual('vNormal0')
        
      it "should map private functions", ->
        expect(map.main).toEqual('main0')

    it "should detect uniforms", ->
      expect(shader.uniforms.length).toEqual 2
      
    it "should detect attributes", ->
      expect(shader.attributes.length).toEqual 2
      
    it "should detect varyings", ->
      expect(shader.varyings.length).toEqual 2
      
    it "should detect functions", ->
      expect(shader.functions.length).toEqual 2
    
    it "should detect globals", ->
      expect(shader.global).toMatch /vec4 _position;/
      
    describe "its source code", ->
      it "should produce a default precision qualifier", ->
        expect(shader.toString()).toMatch /precision mediump float;/

      it "should mangle references to private variables", ->
        expect(shader.toString()).toMatch /gl_Position = pMatrix0 \* mvMatrix \* vec4\(position, 1\)/

      it "should mangle non-shared attributes", ->
        expect(shader.toString()).toMatch /attribute vec3 normal0;/

      it "should mangle non-shared uniforms", ->
        expect(shader.toString()).toMatch /uniform mat4 pMatrix0;/

      it "should mangle non-shared varyings", ->
        expect(shader.toString()).toMatch /varying vec3 vNormal0;/
        
      it "should mangle non-shared functions", ->
        expect(shader.toString()).toMatch /void main0\(void\)/
        
      it "should not mangle shared attributes", ->
        expect(shader.toString()).toMatch /attribute vec4 position;/

      it "should not mangle shared uniforms", ->
        expect(shader.toString()).toMatch /uniform mat4 mvMatrix;/

      it "should not mangle shared varyings", ->
        expect(shader.toString()).toMatch /varying vec3 vPosition;/

      it "should not mangle shared functions", ->
        expect(shader.toString()).toMatch /int myfunc\(int x\)/

      it "should include globals", ->
        expect(shader.toString()).toMatch /vec4 _position;/
