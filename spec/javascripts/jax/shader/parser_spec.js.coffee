describe "Jax.Shader.Parser", ->
  parser = null
  
  describe "exports", ->
    beforeEach -> parser = new Jax.Shader.Parser('void main(void) { export(float, x, 1.0); }')
    
    it "should be detected", ->
      expect(parser.exports).not.toBeEmpty()
    
    it "should be replaced", ->
      expect(parser.functions.main0.body).toMatch /exported_x0 = 1\.0;/
      
    it "should replace one another", ->
      parser = new Jax.Shader.Parser('void main(void) { export(float, x, 1.0); export(float, x, 2.0); }')
      expect(parser.exports.length).toEqual 2
      
    it "should be mangled distinctly", ->
      parser = new Jax.Shader.Parser('void main(void) { export(float, x, 1.0); export(float, x, 2.0); }')
      expect(parser.exports[0].mangledName).not.toEqual parser.exports[1].mangledName
      
  it "should ignore commented phrases that match the function signature", ->
    result = new Jax.Shader.Parser('// void main(void) { }')
    expect(result.functions.all).toBeEmpty()
    
  it "should not lose track of functions when they are preceded with single-line comments", ->
    result = new Jax.Shader.Parser('// some text\n\nvoid main(void) { }')
    expect(result.functions.all).not.toBeEmpty()
  
  describe "without a precision qualifier", ->
    beforeEach -> parser = new Jax.Shader.Parser ""
    
    it "should default float precision to mediump", ->
      expect(parser.precision.float.qualifier).toEqual 'mediump'
      
  describe "with a precision qualifier", ->
    beforeEach -> parser = new Jax.Shader.Parser "precision highp float;"
    
    it "should override default float precision", ->
      expect(parser.precision.float.qualifier).toEqual 'highp'
  
  describe "parsing globally-scoped variables", ->
    beforeEach -> parser = new Jax.Shader.Parser """
    uniform mat4 mvMatrix;
    shared attribute vec3 position;
    
    #ifdef SOMETHING
      vec3 swap;
    #endif
    
    void main(void) {
    }
    
    vec4 anotherSwap;
    """
    
    it "should keep the #ifdef", ->
      expect(parser.global).toMatch /\#ifdef SOMETHING/
    
    it "should keep swap", ->
      expect(parser.global).toMatch /vec3 swap;/
      
    it "should keep anotherSwap", ->
      expect(parser.global).toMatch /vec4 anotherSwap;/
      
    it "ensure no more than 1 blank line appears in sequence", ->
      expect(parser.global).not.toMatch /\n[\s\t]*\n[\s\t]*\n/
      
  describe "parsing private functions", ->
    beforeEach -> parser = new Jax.Shader.Parser "void main(void) {\n\treturn 0;\n}"
    
    it "should find return type", ->
      expect(parser.functions.main0.type).toEqual 'void'
    
    it "should find params", ->
      expect(parser.functions.main0.params).toEqual 'void'
      
    it "should not flag function as shared", ->
      expect(parser.functions.main0.shared).toBeFalsy()
      
    it "should find body", ->
      expect(parser.functions.main0.body.trim()).toEqual 'return 0;'
      
    it "should preserve original name", ->
      expect(parser.functions.main0.name).toEqual 'main'

  describe "parsing shared functions", ->
    beforeEach -> parser = new Jax.Shader.Parser "shared void main(void) {\n\treturn 0;\n}"

    it "should find return type", ->
      expect(parser.functions.main.type).toEqual 'void'

    it "should find params", ->
      expect(parser.functions.main.params).toEqual 'void'

    it "should not flag function as shared", ->
      expect(parser.functions.main.shared).toBeTruthy()

    it "should find body", ->
      expect(parser.functions.main.body.trim()).toEqual 'return 0;'

    it "should preserve original name", ->
      expect(parser.functions.main.name).toEqual 'main'

  describe "parsing private uniforms", ->
    it "should find a single uniform", ->
      parser = new Jax.Shader.Parser "uniform mat4 mvMatrix;"
      expect(parser.uniforms.length).toEqual 1
      
    it "should find two separate uniforms", ->
      parser = new Jax.Shader.Parser "uniform mat4 mvMatrix;\nuniform mat3 nMatrix;"
      expect(parser.uniforms.length).toEqual 2
      
    it "should find multiple joined uniforms", ->
      parser = new Jax.Shader.Parser "uniform mat4 mvMatrix, pMatrix;"
      expect(parser.uniforms.length).toEqual 2

    it "should flag a single uniform as not shared", ->
      expect(new Jax.Shader.Parser("uniform mat4 mvMatrix;").uniforms.mvMatrix0.shared).toBeFalsy()

    it "should flag two separate uniforms as not shared", ->
      parser = new Jax.Shader.Parser "uniform mat4 mvMatrix;\nuniform mat3 nMatrix;"
      expect(parser.uniforms.mvMatrix0.shared).toBeFalsy()
      expect(parser.uniforms.nMatrix0.shared).toBeFalsy()

    it "should flag multiple joined uniforms as not shared", ->
      parser = new Jax.Shader.Parser "uniform mat4 mvMatrix, pMatrix;"
      expect(parser.uniforms.mvMatrix0.shared).toBeFalsy()
      expect(parser.uniforms.pMatrix0.shared).toBeFalsy()

  describe "parsing shared uniforms", ->
    it "should find a single uniform", ->
      parser = new Jax.Shader.Parser "shared uniform mat4 mvMatrix;"
      expect(parser.uniforms.length).toEqual 1

    it "should find two separate uniforms", ->
      parser = new Jax.Shader.Parser "shared uniform mat4 mvMatrix;\nuniform mat3 nMatrix;"
      expect(parser.uniforms.length).toEqual 2

    it "should find multiple joined uniforms", ->
      parser = new Jax.Shader.Parser "shared uniform mat4 mvMatrix, pMatrix;"
      expect(parser.uniforms.length).toEqual 2
  
    it "should flag a single uniform as shared", ->
      expect(new Jax.Shader.Parser("shared uniform mat4 mvMatrix;").uniforms.mvMatrix.shared).toBeTrue()
      
    it "should flag two separate uniforms as shared", ->
      parser = new Jax.Shader.Parser "shared uniform mat4 mvMatrix;\nshared uniform mat3 nMatrix;"
      expect(parser.uniforms.mvMatrix.shared).toBeTrue()
      expect(parser.uniforms.nMatrix.shared).toBeTrue()
      
    it "should flag multiple joined uniforms as shared", ->
      parser = new Jax.Shader.Parser "shared uniform mat4 mvMatrix, pMatrix;"
      expect(parser.uniforms.mvMatrix.shared).toBeTrue()
      expect(parser.uniforms.pMatrix.shared).toBeTrue()

  
  describe "parsing private attributes", ->
    it "should find a single attribute", ->
      parser = new Jax.Shader.Parser "attribute vec4 position;"
      expect(parser.attributes.length).toEqual 1
      
    it "should find two separate attributes", ->
      parser = new Jax.Shader.Parser "attribute vec4 position;\nattribute vec3 normal;"
      expect(parser.attributes.length).toEqual 2
      
    it "should find multiple joined attributes", ->
      parser = new Jax.Shader.Parser "attribute vec4 position, tangent;"
      expect(parser.attributes.length).toEqual 2

    it "should flag a single attribute as not shared", ->
      expect(new Jax.Shader.Parser("attribute vec4 position;").attributes.position0.shared).toBeFalsy()

    it "should flag two separate attributes as not shared", ->
      parser = new Jax.Shader.Parser "attribute vec4 position;\nattribute vec3 normal;"
      expect(parser.attributes.position0.shared).toBeFalsy()
      expect(parser.attributes.normal0.shared).toBeFalsy()

    it "should flag multiple joined attributes as not shared", ->
      parser = new Jax.Shader.Parser "attribute vec4 position, tangent;"
      expect(parser.attributes.position0.shared).toBeFalsy()
      expect(parser.attributes.tangent0.shared).toBeFalsy()

  describe "parsing shared attributes", ->
    it "should find a single attribute", ->
      parser = new Jax.Shader.Parser "shared attribute vec4 position;"
      expect(parser.attributes.length).toEqual 1

    it "should find two separate attributes", ->
      parser = new Jax.Shader.Parser "shared attribute vec4 position;\nattribute vec3 normal;"
      expect(parser.attributes.length).toEqual 2

    it "should find multiple joined attributes", ->
      parser = new Jax.Shader.Parser "shared attribute vec4 position, tangent;"
      expect(parser.attributes.length).toEqual 2
  
    it "should flag a single attribute as shared", ->
      expect(new Jax.Shader.Parser("shared attribute vec4 position;").attributes.position.shared).toBeTrue()
      
    it "should flag two separate attributes as shared", ->
      parser = new Jax.Shader.Parser "shared attribute vec4 position;\nshared attribute vec3 normal;"
      expect(parser.attributes.position.shared).toBeTrue()
      expect(parser.attributes.normal.shared).toBeTrue()
      
    it "should flag multiple joined attributes as shared", ->
      parser = new Jax.Shader.Parser "shared attribute vec4 position, tangent;"
      expect(parser.attributes.position.shared).toBeTrue()
      expect(parser.attributes.tangent.shared).toBeTrue()


  describe "parsing private varyings", ->
    it "should find a single varying", ->
      parser = new Jax.Shader.Parser "varying vec4 position;"
      expect(parser.varyings.length).toEqual 1

    it "should find two separate varyings", ->
      parser = new Jax.Shader.Parser "varying vec4 position;\nvarying vec3 normal;"
      expect(parser.varyings.length).toEqual 2

    it "should find multiple joined varyings", ->
      parser = new Jax.Shader.Parser "varying vec4 position, tangent;"
      expect(parser.varyings.length).toEqual 2

    it "should flag a single varying as not shared", ->
      expect(new Jax.Shader.Parser("varying vec4 position;").varyings.position0.shared).toBeFalsy()

    it "should flag two separate varyings as not shared", ->
      parser = new Jax.Shader.Parser "varying vec4 position;\nvarying vec3 normal;"
      expect(parser.varyings.position0.shared).toBeFalsy()
      expect(parser.varyings.normal0.shared).toBeFalsy()

    it "should flag multiple joined varyings as not shared", ->
      parser = new Jax.Shader.Parser "varying vec4 position, tangent;"
      expect(parser.varyings.position0.shared).toBeFalsy()
      expect(parser.varyings.tangent0.shared).toBeFalsy()

  describe "parsing shared varyings", ->
    it "should find a single varying", ->
      parser = new Jax.Shader.Parser "shared varying vec4 position;"
      expect(parser.varyings.length).toEqual 1

    it "should find two separate varyings", ->
      parser = new Jax.Shader.Parser "shared varying vec4 position;\nvarying vec3 normal;"
      expect(parser.varyings.length).toEqual 2

    it "should find multiple joined varyings", ->
      parser = new Jax.Shader.Parser "shared varying vec4 position, tangent;"
      expect(parser.varyings.length).toEqual 2

    it "should flag a single varying as shared", ->
      expect(new Jax.Shader.Parser("shared varying vec4 position;").varyings.position.shared).toBeTrue()

    it "should flag two separate varyings as shared", ->
      parser = new Jax.Shader.Parser "shared varying vec4 position;\nshared varying vec3 normal;"
      expect(parser.varyings.position.shared).toBeTrue()
      expect(parser.varyings.normal.shared).toBeTrue()

    it "should flag multiple joined varyings as shared", ->
      parser = new Jax.Shader.Parser "shared varying vec4 position, tangent;"
      expect(parser.varyings.position.shared).toBeTrue()
      expect(parser.varyings.tangent.shared).toBeTrue()
