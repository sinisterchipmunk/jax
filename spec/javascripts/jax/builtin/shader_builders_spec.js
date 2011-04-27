describe("Built-in Shader Builder:", function() {
  var context;
  beforeEach(function() { context = new Jax.Context(document.getElementById('canvas-element')); });
  afterEach(function() { context.dispose(); });
  
  var shaders = Jax.Util.properties(Jax.shaders);
  for (var i = 0; i < shaders.length; i++)
  {
    if (!shaders[i].getVertexShader) continue;
    
    describe(shaders[i], function() {
      var shader_name = shaders[i];
      it("should compile", function() {
        var matr = new Jax.Material();
        var obj = new Jax.Mesh({material:matr,shader:shader_name});
        spyOn(matr, 'buildShader').andCallThrough();
        obj.render(context);
        expect(matr.buildShader).toHaveBeenCalledWith(shader_name, context);
      });
      
      it("should use the shader from world", function() {
        var obj = new Jax.Model({mesh:new Jax.Mesh.Sphere({shader:shader_name})});
        var called = false;
        obj.mesh.render = function(context, options) {
          called = called || this.getNormalizedRenderOptions(options).shader == shader_name;
        };
        context.world.addObject(obj);
        context.world.render();
        expect(called).toBeTrue();
      });
    });
    
    describe(shaders[i]+" with a normal map", function() {
      var matr;
      beforeEach(function() { matr = new Jax.Material({texture:{type:Jax.NORMAL_MAP,path:"/public/images/normal_map.jpg"}}); });
      
      var shader_name = shaders[i];
      it("should use the shader from world", function() {
        var obj = new Jax.Model({mesh:new Jax.Mesh.Sphere({material:matr,shader:shader_name})});
        var called = false;
        obj.mesh.render = function(context, options) {
          called = called || this.getNormalizedRenderOptions(options).shader == shader_name;
        };
        context.world.addObject(obj);
        context.world.render();
        expect(called).toBeTrue();
      });
    });

    describe(shaders[i]+" with 1 texture", function() {
      var matr;
      beforeEach(function() {
        matr = new Jax.Material({texture:"/public/images/rss.png"});
      });
      
      var shader_name = shaders[i];
      it("should compile", function() {
        var obj = new Jax.Mesh({material:matr,shader:shader_name});
        spyOn(matr, 'buildShader').andCallThrough();
        obj.render(context);
        expect(matr.buildShader).toHaveBeenCalledWith(shader_name, context);
      });
      
      it("should use the shader from world", function() {
        var obj = new Jax.Model({mesh:new Jax.Mesh.Sphere({material:matr,shader:shader_name})});
        var called = false;
        obj.mesh.render = function(context, options) {
          called = called || this.getNormalizedRenderOptions(options).shader == shader_name;
        };
        context.world.addObject(obj);
        context.world.render();
        expect(called).toBeTrue();
      });
    });
  }
});
