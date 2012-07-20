describe "Jax.Shader", ->
  shader = log = null
  beforeEach ->
    log = false
    shader = new Jax.Shader()
  sim = ->
    console.log shader.toString() if log
    new ShaderScript.Simulator(vertex: shader.toString()).start()
  variable = (name) -> sim().state.variables[name]
  simval = (name) -> variable(name).value
  
  describe 'toString', ->
    it 'should produce the same results each time', ->
      shader.append 'void main(void) { gl_Position = vec4(1); }'
      expect(shader.toString()).toEqual shader.toString()
      
  describe "shared functions", ->
    beforeEach ->
      shader.append 'shared void x() { }'
      
    it 'should not be mangled', ->
      expect(shader.toString()).toMatch /void x\(/
      
    it 'should not leave the "shared" keyword', ->
      expect(shader.toString()).not.toMatch /shared/
  
  describe 'append', ->
    map = null
    beforeEach ->
      map = shader.append 'uniform float one; shared uniform float two;'
    
    it 'should return a name mangling map', ->
      expect(map.one).not.toEqual 'one'
      expect(map.two).toEqual 'two'
  
  describe "an empty addition", ->
    beforeEach -> shader.append ""
    
    it "should not produce `undefined` in the sources", ->
      expect(shader.toString()).not.toMatch /undefined/
  
  describe 'using built-in functions', ->
    beforeEach -> shader.append 'float x; void main(void) { x = pow(2.0, 2.0); }'
    
    it 'should not mangle references', ->
      expect(simval 'x').toEqual 4
  
  describe 'with shared uniforms defined in multiple appendages', ->
    beforeEach ->
      shader.append 'shared uniform float one;'
      shader.append 'shared uniform float one;'
    
    it 'should not redefine them', ->
      expect(shader.toString().indexOf('uniform float one')).toEqual shader.toString().lastIndexOf('uniform float one')
  
  describe 'with multiple shared uniforms declared at once', ->
    beforeEach -> shader.append 'shared uniform float one, two, three;'
    
    it 'should define them all', ->
      expect(variable 'one').not.toBeUndefined()
      expect(variable 'two').not.toBeUndefined()
      expect(variable 'three').not.toBeUndefined()
  
  describe 'with multiple un-shared uniforms declared at once', ->
    beforeEach ->
      shader.append 'uniform float one, two, three;', 0

    it 'should mangle them all', ->
      expect(variable 'one0').not.toBeUndefined()
      expect(variable 'two0').not.toBeUndefined()
      expect(variable 'three0').not.toBeUndefined()

  describe "with an appendage that exported a variable", ->
    beforeEach -> shader.append 'void main() { export(float, x, 1.0); export(float, x, 1.0); }'
    
    describe "importing it", ->
      beforeEach -> shader.append 'float t = 0.0; void main() { import(x, t += x); }'
      
      it "should accumulate as many times as it was exported", ->
        expect(simval 't').toEqual 2
        
  describe 'with two cached blocks', ->
    beforeEach ->
      shader.append 'float x; void main(void) { cache(float, y) { x = 1.0;} }'
      shader.append 'float x; void main(void) { cache(float, y) { x = 1.0;} }'
    
    it 'should only evaluate the first block', ->
      expect(simval 'x').toEqual 1
      
  describe "with a cache assignment", ->
    beforeEach -> shader.append 'void main(void) { cache(float, y) { y = 1.0; } }'
    
    it 'should define the variable', ->
      expect(simval 'y').toEqual 1
  
  describe 'with an appendage with a main', ->
    beforeEach -> shader.append 'float x; void main(void) { x = 1.0; }', 0
    
    it "should mangle the main", ->
      expect(shader.toString()).toMatch /void main0/
      
    it "should execute the main", ->
      expect(simval 'x').toEqual 1
  
  describe "pushing code into main", ->
    beforeEach -> shader.main.push 'float x = 1.5;'
    
    it "should process the pushed code", ->
      expect(simval 'x').toEqual 1.5
      
  it "should set float precision to mediump", ->
    expect(shader.toString()).toMatch /precision mediump float;/
    
  describe "with a specified precision", ->
    beforeEach -> shader.append "precision highp float;"
    
    it "should not set mediump precision", ->
      expect(shader.toString()).not.toMatch /precision mediump float;/
      
    it "should not alter the specified precision", ->
      expect(shader.toString()).toMatch /precision highp float;/
      
  describe "shared", ->
    describe "injecting a shared attribute", ->
      beforeEach -> shader.append "shared attribute vec3 x;"
    
      it "should not mangle the name", ->
        expect(variable 'x').not.toBeUndefined()
      
    describe "injecting a shared uniform", ->
      beforeEach -> shader.append "shared uniform vec3 xyz;"

      it "should not mangle the name", ->
        expect(variable 'xyz').not.toBeUndefined()

    describe "injecting a shared varying", ->
      beforeEach -> shader.append "shared varying vec3 x;"

      it "should not mangle the name", ->
        expect(variable 'x').not.toBeUndefined()

    describe "referencing a shared attribute", ->
      s = null
      beforeEach ->
        shader.append 'shared attribute float x; void t(void) { float y = x + 1.0; }', 0
        shader.main.push 't0();'
        s = new ShaderScript.Simulator vertex: shader.toString()
        s.state.variables.x.value = 2.0
        s.start()

      it "should not mangle the reference", ->
        expect(s.state.scope.find('root.block.t0.block.y').value).toEqual 3

    describe "referencing a shared uniform", ->
      s = null
      beforeEach ->
        shader.append 'shared uniform float x; void t(void) { float y = x + 1.0; }', 0
        shader.main.push 't0();'
        s = new ShaderScript.Simulator vertex: shader.toString()
        s.state.variables.x.value = 2.0
        s.start()

      it "should not mangle the reference", ->
        expect(s.state.scope.find('root.block.t0.block.y').value).toEqual 3

    describe "referencing a shared varying", ->
      s = null
      beforeEach ->
        shader.append 'shared varying float x; void t(void) { float y = x + 1.0; }', 0
        shader.main.push 't0();'
        s = new ShaderScript.Simulator vertex: shader.toString()
        s.state.variables.x.value = 2.0
        s.start()

      it "should not mangle the reference", ->
        expect(s.state.scope.find('root.block.t0.block.y').value).toEqual 3

  describe "un-shared", ->
    describe "injecting an un-shared attribute", ->
      beforeEach -> shader.append "attribute vec3 x;", 0
    
      it "should mangle the name", ->
        expect(variable 'x0').not.toBeUndefined()
      
    describe "injecting an un-shared uniform", ->
      beforeEach -> shader.append "uniform vec3 x;", 0

      it "should mangle the name", ->
        expect(variable 'x0').not.toBeUndefined()

    describe "injecting an un-shared varying", ->
      beforeEach -> shader.append "varying vec3 x;", 0

      it "should mangle the name", ->
        expect(variable 'x0').not.toBeUndefined()

    describe "referencing an un-shared attribute", ->
      s = null
      beforeEach ->
        shader.append 'attribute float x; void t(void) { float y = x + 1.0; }', 0
        shader.main.push 't0();'
        s = new ShaderScript.Simulator vertex: shader.toString()
        s.state.variables.x0.value = 2.0
        s.start()
    
      it "should mangle the reference", ->
        expect(s.state.scope.find('root.block.t0.block.y').value).toEqual 3

    describe "referencing an un-shared uniform", ->
      s = null
      beforeEach ->
        shader.append 'uniform float x; void t(void) { float y = x + 1.0; }', 0
        shader.main.push 't0();'
        s = new ShaderScript.Simulator vertex: shader.toString()
        s.state.variables.x0.value = 2.0
        s.start()

      it "should mangle the reference", ->
        expect(s.state.scope.find('root.block.t0.block.y').value).toEqual 3

    describe "referencing an un-shared varying", ->
      s = null
      beforeEach ->
        shader.append 'varying float x; void t(void) { float y = x + 1.0; }', 0
        shader.main.push 't0();'
        s = new ShaderScript.Simulator vertex: shader.toString()
        s.state.variables.x0.value = 2.0
        s.start()

      it "should mangle the reference", ->
        expect(s.state.scope.find('root.block.t0.block.y').value).toEqual 3
