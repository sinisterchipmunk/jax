Jax.POINT_LIGHT       = 1;
Jax.SPOT_LIGHT        = 2;
Jax.DIRECTIONAL_LIGHT = 3;

/*
  FIXME Resource manager looks for an object in the global namespace, so using Jax.Scene.LightSource
  instead of just LightSource results in a broken resource load.
 */
var LightSource = Jax.Scene.LightSource = (function() {
  function setupProjection(self) {
    if (self.camera.projection) return;
    
    switch(self.type) {
      case Jax.DIRECTIONAL_LIGHT:
        self.camera.ortho({left:-1,right:1, top:1,bottom:-1, near:-1,far:1 });
        self.camera.setPosition(0,0,0);
        break;
      case Jax.POINT_LIGHT:
        self.camera.perspective({fov:45,near:0.01,far:500,width:2048,height:2048});
        break;
      case Jax.SPOT_LIGHT:
        self.camera.perspective({near:0.1,far:500,fov:60,width:2048,height:2048});
        break;
      default:
        throw new Error("Unexpected light type: "+self.type);
    }
  }
  
  return Jax.Model.create({
    initialize: function($super, data) {
      data = Jax.Util.normalizeOptions(data, {
        enabled: true,
        type: Jax.POINT_LIGHT,
        color: {
          ambient: [0,0,0,1],
          diffuse: [1,1,1,1],
          specular: [1,1,1,1]
        },
        position: [0,0,0],
        direction: [0,0,-1],
        angle: Math.PI/6,
        attenuation: {
          constant: 0,
          linear: 0.02,
          quadratic: 0
        },
        spotExponent: 0,
        shadowcaster: true
      });
      
      if (typeof(data.type) == "string") data.type = Jax[data.type] || data.type;
      data.color.ambient = Jax.Util.colorize(data.color.ambient);
      data.color.diffuse = Jax.Util.colorize(data.color.diffuse);
      data.color.specular= Jax.Util.colorize(data.color.specular);
      $super(data);

      this.shadowMatrix = mat4.create();
      
      this.framebuffers = [new Jax.Framebuffer({width:2048,height:2048,depth:true,color:GL_RGBA}),
                           new Jax.Framebuffer({width:2048,height:2048,depth:true,color:GL_RGBA})];

      setupProjection(this);
    },
    
    getPosition: function() { setupProjection(this); return this.camera.getPosition(); },
    getDirection: function() { setupProjection(this); return this.camera.getViewVector(); },

    setEnabled: function(b) { this.enabled = b; },
    enable: function() { this.setEnabled(true); },
    disable: function() { this.setEnabled(false); },

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
      setupProjection(this);
      return this.framebuffers[0].getTextureBuffer(context, 0);
    },
    
    getShadowMapTextures: function(context) {
      setupProjection(this);
      return [this.framebuffers[0].getTextureBuffer(context, 0),
              this.framebuffers[1].getTextureBuffer(context, 0)];
    },
    
    isShadowMapEnabled: function() {
      return !!(this.framebuffers && this.isShadowcaster());
    },
    
    getShadowMatrix: function() {
      return this.shadowMatrix;
    },
    
    isShadowcaster: function() { return this.shadowcaster; },
    
    getDPShadowNear: function() { setupProjection(this); return this.camera.projection.near; },
    
    getDPShadowFar: function() { setupProjection(this); return this.camera.projection.far; },
    
    updateShadowMap: function(context, sceneBoundingRadius, objects) {
      setupProjection(this);
      
      var self = this;
      var sm = this.shadowMatrix;
      var lightToSceneDistance = vec3.length(this.camera.getPosition());
      var nearPlane = lightToSceneDistance - sceneBoundingRadius;
      if (nearPlane < 0.01) nearPlane = 0.01;

      if (this.type == Jax.DIRECTIONAL_LIGHT) {
        this.camera.ortho({left:-sceneBoundingRadius,right:sceneBoundingRadius,
                           top:sceneBoundingRadius,bottom:-sceneBoundingRadius,
                           near:-sceneBoundingRadius,far:sceneBoundingRadius
        });
        this.camera.setPosition(0,0,0);
      } else if (this.type == Jax.SPOT_LIGHT) {
        // Save the depth precision for where it's useful
        var fieldOfView = Math.radToDeg(2.0 * Math.atan(sceneBoundingRadius / lightToSceneDistance));
      
//        fieldOfView = Math.radToDeg(this.getAngle());
        fieldOfView = 60;
        this.camera.perspective({near:nearPlane,far:nearPlane+(2.0*sceneBoundingRadius),fov:fieldOfView,width:2048,height:2048});
      } else if (this.type == Jax.POINT_LIGHT) {
        
        context.glDisable(GL_BLEND);
        context.glEnable(GL_CULL_FACE);
        context.glCullFace(GL_FRONT);
        context.glEnable(GL_POLYGON_OFFSET_FILL);
        context.glPolygonOffset(2.0, 2.0);
        
        context.pushMatrix(function() {
          self.framebuffers[0].bind(context, function() {
            // front paraboloid
            self.framebuffers[0].viewport(context);
            context.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
            context.loadViewMatrix(self.camera.getModelViewMatrix());
            mat4.set(context.getInverseViewMatrix(), sm);
            
            for (var i = 0; i < objects.length; i++) {
              objects[i].render(context, {material:'paraboloid', direction:1});
            }
          });

          self.framebuffers[1].bind(context, function() {
            // back paraboloid
            self.framebuffers[1].viewport(context);
            context.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
            context.loadViewMatrix(self.camera.getModelViewMatrix());
            for (var i = 0; i < objects.length; i++) {
              objects[i].render(context, {material:'paraboloid',direction:-1});
            }
          });
  
          context.glDisable(GL_POLYGON_OFFSET_FILL);
          context.glEnable(GL_BLEND);
          context.glCullFace(GL_BACK);
          context.glDisable(GL_CULL_FACE);

          // restore the original context viewport
          context.glViewport(0, 0, context.canvas.width, context.canvas.height);
        });

        return;
      }
      
      this.framebuffers[0].bind(context, function() {
        self.framebuffers[0].viewport(context);
        context.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        context.pushMatrix(function() {
          self.framebuffers[0].viewport(context);
          context.matrix_stack.loadProjectionMatrix(self.camera.getProjectionMatrix());
          context.matrix_stack.loadViewMatrix(self.camera.getModelViewMatrix());
          mat4.identity(sm);
          sm[0] = sm[5] = sm[10] = sm[12] = sm[13] = sm[14] = 0.5;
          mat4.multiply(sm, context.getModelViewProjectionMatrix());
          
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
        // restore the original context viewport
        context.glViewport(0, 0, context.canvas.width, context.canvas.height);
      });
    }
  });
})();
