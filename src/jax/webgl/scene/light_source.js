Jax.POINT_LIGHT       = 1;
Jax.SPOT_LIGHT        = 2;
Jax.DIRECTIONAL_LIGHT = 3;

Jax.Scene.LightSource = (function() {
  return Jax.Model.create({
    initialize: function($super, data) {
      data = data || {};
      data.attenuation = data.attenuation || {};
      data.color = data.color || {};

      function default_field(name, value, obj) {
        obj = obj || data;
        if (typeof(obj[name]) == "undefined")
          obj[name] = value;
      }
      
      default_field('enabled', true);
      default_field('type', Jax.POINT_LIGHT);
      default_field('ambient', [0,0,0,1], data.color);
      default_field('diffuse', [1,1,1,1], data.color);
      default_field('specular', [1,1,1,1],data.color);
      default_field('position', [0,0,0]);
      default_field('direction', [-1,-1,-1]);
      default_field('angle', Math.PI/6);
      default_field('spotExponent', 0);
      default_field('constant', 0, data.attenuation);
      default_field('linear', 0.02, data.attenuation);
      default_field('quadratic', 0, data.attenuation);
      
      $super(data);

      this.shadowMatrix = mat4.create();
    },
    
    getPosition: function() { return this.camera.getPosition(); },
    getDirection: function() { return this.camera.getViewVector(); },

    isEnabled: function() { return this.enabled; },
    getType: function() { return this.type; },

    getDiffuseColor: function() { return this.color.diffuse; },
    getAmbientColor: function() { return this.color.ambient; },
    getSpecularColor: function() { return this.color.specular; },
    getConstantAttenuation: function() { return this.attenuation.constant; },
    getQuadraticAttenuation: function() { return this.attenuation.quadratic; },
    getLinearAttenuation: function() { return this.attenuation.linear; },
    getAngle: function() { return this.angle; },
    getSpotExponent: function() { return this.spotExponent; },
    getSpotCosCutoff: function() { return Math.cos(this.angle); },
    
    getShadowMapTexture: function(context) {
      if (this.framebuffer) return this.framebuffer.getTextureBuffer(context, 0);
      return null;
    },
    
    isShadowMapEnabled: function() {
      return !!(this.framebuffer && true);
    },
    
    getShadowMatrix: function() {
      return this.shadowMatrix;
    },
    
    updateShadowMap: function(context, sceneBoundingRadius, objects) {
      // Save the depth precision for where it's useful
      var lightToSceneDistance = vec3.length(this.camera.getPosition());
      var nearPlane = lightToSceneDistance - sceneBoundingRadius;
      if (nearPlane < 0.01) nearPlane = 0.01;
      var fieldOfView = Math.radToDeg(2.0 * Math.atan(sceneBoundingRadius / lightToSceneDistance));
    
      this.camera.perspective({near:nearPlane,far:nearPlane+(2.0*sceneBoundingRadius),fov:fieldOfView,width:2048,height:2048});
      this.camera.lookAt([0,0,0],[0,1,0]);

      var self = this;
      var sm = this.shadowMatrix, tmpm = mat4.create();
      mat4.identity(sm);
      
      // translate 0.5, scale 0.5
//      var bias = mat4.create();
//      bias[0] = bias[5] = bias[10] = bias[12] = bias[13] = bias[14] = 0.5;
//      mat4.multiply(bias, this.camera.getProjectionMatrix(), sm);
      mat4.set(this.camera.getProjectionMatrix(), sm);
      mat4.multiply(sm, mat4.inverse(this.camera.getModelViewMatrix(), tmpm), sm);
      mat4.multiply(sm, mat4.inverse(context.getModelViewMatrix(), tmpm), sm);
      
      if (!this.framebuffer)
        this.framebuffer = new Jax.Framebuffer({width:2048,height:2048,depth:true,color:GL_RGBA});

      this.framebuffer.bind(context, function() {
        context.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        context.pushMatrix(function() {
          mat4.set(self.camera.getProjectionMatrix(), context.getProjectionMatrix());
          mat4.inverse(self.camera.getModelViewMatrix(), context.getModelViewMatrix());
          context.glEnable(GL_CULL_FACE);
          context.glCullFace(GL_FRONT);
          context.glDisable(GL_BLEND);
          context.glEnable(GL_POLYGON_OFFSET_FILL);
          context.glPolygonOffset(2.0, 2.0);
          for (var i = 0; i < objects.length; i++) {
            objects[i].render(context, {material:'depthmap'});
          }
          context.glDisable(GL_POLYGON_OFFSET_FILL);
          context.glEnable(GL_BLEND);
          context.glCullFace(GL_BACK);
          context.glDisable(GL_CULL_FACE);
        });
      });
    }
  });
})();
