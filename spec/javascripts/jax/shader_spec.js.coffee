describe "Jax.Shader", ->
  shader = null
  beforeEach -> shader = new Jax.Shader
  
  describe "parsing exports of private varyings", ->
    beforeEach -> shader.append "varying vec4 vPos; void main() { export(vec4, exPos, vPos); }"
    
    it "should parse exports with numbers", ->
      expect(shader.toString()).not.toMatch /export/
      
  it "should mangle references to mangled functions", ->
    shader.append "void mangleThis() { }\n\nvoid main() { mangleThis() }"
    expect(shader.toString()).not.toMatch /mangleThis\(/
  
  it "should not err on empty params", ->
    expect(-> shader.append "void main() { }").not.toThrow()
    
  
  ###

  void main0(void) {
    export(vec4, color, vColor * diffuse);
  }

  void main1(void) {
    vec4 color = import(color, vec4(1));
  }

  ==

  vec4 EXPORT_color;

  void main0(void) {
    #define HAVE_EXPORT_color 1
    EXPORT_color = vColor * diffuse;
  }

  void main1(void) {
    vec4 color =
      #ifdef HAVE_EXPORT_COLOR
        EXPORT_color
      #else
        vec4(1)
      #endif
    ;
  }

  ###
  
  describe "exports with no expression", ->
    it "should raise a coherent error", ->
      expect(-> shader.append 'void main(void) { export(vec4, POSITION); }'; shader.toString()).toThrow("Export requires 3 arguments: type, name and expression")
  
  describe "exports with no imports", ->
    beforeEach -> shader.append 'void main(void) { export(vec4, POSITION, vec4(1, 1, 1, 1)); }'
    
    it "should produce only the export expression, not the export itself", ->
      expect(shader.toString()).not.toMatch /POSITION/
      expect(shader.toString()).toMatch /vec4\(1, 1, 1, 1\);/
      
  describe "imports with no exports", ->
    beforeEach -> shader.append 'void main(void) { import(POSITION, vec4(1, 1, 1, 1)); }'
    
    it "should not use the export", ->
      expect(shader.toString()).not.toMatch /POSITION/
      
    it "should use the default", ->
      expect(shader.toString()).toMatch /vec4/
      
  describe "exports and imports", ->
    beforeEach -> shader.append 'void main(void) {export(vec4, POSITION, vec4(1, 1, 1, 1));a = import(POSITION, 1.0);}'
    
    it "should create the export", ->
      expect(shader.toString()).toMatch /vec4 EXPORT_POSITION;/
      
    it "should #define the export", ->
      expect(shader.toString()).toMatch /\#define HAVE_EXPORT_POSITION 1/
      
    it "should assign the export", ->
      expect(shader.toString()).toMatch /EXPORT_POSITION = vec4\(1, 1, 1, 1\)/
    
    it "should import by checking the #define", ->
      expect(shader.toString()).toMatch /a = \n\s*\#ifdef HAVE_EXPORT_POSITION\n\s*EXPORT_POSITION\n\s*\#else\n\s*1.0\n\s*\#endif\n\s*;/
  
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
