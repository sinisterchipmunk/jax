describe "Jax.Shader2", ->
  shader = null
  beforeEach -> shader = new Jax.Shader2
  
  describe "exports with no imports", ->
    beforeEach -> shader.append 'export(vec4, POSITION, vec4(1, 1, 1, 1));'
    
    it "should produce no code", ->
      expect(shader.toString()).not.toMatch /POSITION/
      expect(shader.toString()).not.toMatch /vec4/
      
  describe "imports with no exports", ->
    beforeEach -> shader.append 'import(POSITION, vec4(1, 1, 1, 1));'
    
    it "should not use the export", ->
      expect(shader.toString()).not.toMatch /POSITION/
      
    it "should use the default", ->
      expect(shader.toString()).toMatch /vec4/
      
  describe "exports and imports", ->
    beforeEach -> shader.append 'export(vec4, POSITION, vec4(1, 1, 1, 1));a = import(POSITION, 1.0);'
    
    it "should create the export", ->
      expect(shader.toString()).toMatch /vec4 POSITION;/
      
    it "should assign the export", ->
      expect(shader.toString()).toMatch /POSITION = vec4\(1, 1, 1, 1\);/
    
    it "should not use the import default", ->
      expect(shader.toString()).not.toMatch /1\.0/
      
    it "should use the import variable", ->
      expect(shader.toString()).toMatch /a = POSITION;/
  
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
