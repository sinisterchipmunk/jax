Jax.POINT_LIGHT       = 1;
Jax.SPOT_LIGHT        = 2;
Jax.DIRECTIONAL_LIGHT = 3;

Jax.Scene.LightSource = (function() {
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
        spot_exponent: 0,
        shadowcaster: true
      });
      // Jax.Model uses `shadow_caster`, but previous versions of LightSource used `shadowcaster`.
      // TODO deprecate both `shadow_caster` and `shadowcaster` in favor of something like boolean `shadows`.
      data.shadow_caster = data.shadowcaster;
      delete data.shadowcaster;
      
      if (typeof(data.type) == "string") data.type = Jax[data.type] || data.type;
      data.color.ambient = Jax.Util.colorize(data.color.ambient);
      data.color.diffuse = Jax.Util.colorize(data.color.diffuse);
      data.color.specular= Jax.Util.colorize(data.color.specular);
      $super(data);
      
      var self = this;
      this.camera.addEventListener('updated', function() { self.invalidate(); });

      this.spotExponent = this.spot_exponent;
      delete this.spot_exponent;

      if (this.isShadowCaster()) {
        this.shadowMatrix = mat4.create();
        this.framebuffers = [new Jax.Framebuffer({width:1024,height:1024,depth:true,color:GL_RGBA}),
                             new Jax.Framebuffer({width:1024,height:1024,depth:true,color:GL_RGBA})];
        setupProjection(this);
      }
    },
    
    format: function() {
      this._format = this._format || new glMatrixArrayType(Jax.Scene.LightSource.STRUCT_SIZE);
      var i, j, len = 0, self = this;
      function push() { for (j = 0; j < arguments.length; j++) self._format[len++] = arguments[j]; }
      for (i = 0; i < arguments.length; i++) {
        switch(arguments[i]) {
          case Jax.Scene.LightSource.POSITION:              push.apply(this, this.getPosition());      break;
          case Jax.Scene.LightSource.DIRECTION:             push.apply(this, this.getDirection());     break;
          case Jax.Scene.LightSource.AMBIENT:               push.apply(this, this.getAmbientColor());  break;
          case Jax.Scene.LightSource.DIFFUSE:               push.apply(this, this.getDiffuseColor());  break;
          case Jax.Scene.LightSource.SPECULAR:              push.apply(this, this.getSpecularColor()); break;
          case Jax.Scene.LightSource.CONSTANT_ATTENUATION:  push(this.getConstantAttenuation());       break;
          case Jax.Scene.LightSource.LINEAR_ATTENUATION:    push(this.getLinearAttenuation());         break;
          case Jax.Scene.LightSource.QUADRATIC_ATTENUATION: push(this.getQuadraticAttenuation());      break;
          case Jax.Scene.LightSource.SPOTLIGHT_EXPONENT:    push(this.getSpotExponent());              break;
          case Jax.Scene.LightSource.SPOTLIGHT_COS_CUTOFF:  push(this.getSpotCosCutoff());             break;
          default: throw new Error("Unexpected light source format descriptor: "+arguments[i]);
        }
      }
      return this._format;
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
      return this.framebuffers[0].getTexture(context, 0);
    },
    
    getShadowMapTextures: function(context) {
      setupProjection(this);
      return [this.framebuffers[0].getTexture(context, 0),
              this.framebuffers[1].getTexture(context, 0)];
    },
    
    isShadowMapEnabled: function() {
      return !!(this.framebuffers && this.isShadowcaster());
    },
    
    getShadowMatrix: function() {
      return this.shadowMatrix;
    },
    
    registerCaster: function(object) {
      var self = this;
      function updated() { self.invalidate(); }
      object.camera.addEventListener('updated', updated);
      this.invalidate();
    },
    
    unregisterCaster: function(object) {
      /* FIXME remove the shadowmap event listener from object's camera matrix */
    },
    
    getDPShadowNear: function() { setupProjection(this); return this.camera.projection.near; },
    
    getDPShadowFar: function() { setupProjection(this); return this.camera.projection.far; },
    
    invalidate: function() { this.valid = false; },
    
    render: function(context, objects, material) {
      if (!this.valid) {
        // calculate maximum distance, holding attenuation at 0.001, so we can
        // skip shadowmapping of objects too far away
        // Dmax = R(sqrt(Li/Ic) - 1)
        //    where R is light radius (always 1 in Jax)
        //    and Li is light intensity
        //    and Ic is lowest acceptable attenuation
        this.max_distance = Math.sqrt(this.getIntensity() / 0.001) - 1;

        var real_pass = context.current_pass;
        /* shadowgen pass */
        context.current_pass = Jax.Scene.SHADOWMAP_PASS;
        // Look for errors while rendering the shadow map; if any occur, log them, but then
        // disable shadowmap generation so Jax can continue without shadow support.
        if (this.isShadowCaster())
          try {
            this.updateShadowMap(context, this.boundingRadius, objects, material);
          } catch(e) {
            if (Jax.getGlobal().console && Jax.getGlobal().console.log)
              Jax.getGlobal().console.log(e.toString());
            this.disableShadows();
          }
        this.valid = true;
        context.current_pass = real_pass;
      }
      
      this.renderWithinRange(context, objects, material);
    },
    
    // Renders all objects within range of this light source, based on its color intensity
    // and attenuation coefficients.
    //
    renderWithinRange: function(context, objects, material) {
      for (var j = 0; j < objects.length; j++) {
        if (objects[j].isLit()) {
          var dist = vec3.dist(this.camera.getPosition(), objects[j].camera.getPosition())
                   - objects[j].getBoundingSphereRadius();

          if (dist < this.max_distance)
            // it could be unlit but still in array if it casts a shadow
            objects[j].render(context, material);
        }
      }
    },
    
    // returns a single float value representing the sum of the average intensities of each color channel
    // of ambient, diffuse and specular components.
    getIntensity: function() {
      var c = this.color;
      return (c.ambient[0] * c.ambient[3] + c.ambient[1] * c.ambient[3] + c.ambient[2] * c.ambient[3] +
              c.diffuse[0] * c.diffuse[3] + c.diffuse[1] * c.diffuse[3] + c.diffuse[2] * c.diffuse[3] +
              c.specular[0]* c.specular[3]+ c.specular[1]* c.specular[3]+ c.specular[2]* c.specular[3]) / 3.0;
    },
    
    updateShadowMap: function(context, sceneBoundingRadius, objects, material) {
      // we can't afford to taint the original options
      var render_options = {force: true};
      if (this.max_distance < sceneBoundingRadius) this.max_distance = sceneBoundingRadius;
      
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
        var paraboloid_depthmap = Jax.Material.find("paraboloid-depthmap");
        
        context.gl.disable(GL_BLEND);
        context.gl.enable(GL_CULL_FACE);
        context.gl.cullFace(GL_FRONT);
        context.gl.enable(GL_POLYGON_OFFSET_FILL);
        context.gl.polygonOffset(2.0, 2.0);
        
        var matrix_stack = context.matrix_stack;
        context.pushMatrix(function() {
          render_options.direction = 1;
          render_options.material = paraboloid_depthmap;
          
          self.framebuffers[0].bind(context, function() {
            // front paraboloid
            self.framebuffers[0].viewport(context);
            context.gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
            matrix_stack.loadViewMatrix(self.camera.getTransformationMatrix());
            mat4.set(matrix_stack.getInverseViewMatrix(), sm);
            
            self.renderWithinRange(context, objects, render_options);
          });

          render_options.direction = -1;
          
          self.framebuffers[1].bind(context, function() {
            // back paraboloid
            self.framebuffers[1].viewport(context);
            context.gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
            matrix_stack.loadViewMatrix(self.camera.getTransformationMatrix());
            self.renderWithinRange(context, objects, render_options);
          });
  
          context.gl.disable(GL_POLYGON_OFFSET_FILL);
          context.gl.enable(GL_BLEND);
          context.gl.cullFace(GL_BACK);
          context.gl.disable(GL_CULL_FACE);

          // restore the original context viewport
          context.gl.viewport(0, 0, context.canvas.width, context.canvas.height);
        });

        return;
      }
      
      render_options.material = "depthmap";
      
      var matrix_stack = context.matrix_stack;
      this.framebuffers[0].bind(context, function() {
        self.framebuffers[0].viewport(context);
        context.gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        context.pushMatrix(function() {
          self.framebuffers[0].viewport(context);
          matrix_stack.loadProjectionMatrix(self.camera.getProjectionMatrix());
          matrix_stack.loadViewMatrix(self.camera.getTransformationMatrix());
          mat4.identity(sm);
          sm[0] = sm[5] = sm[10] = sm[12] = sm[13] = sm[14] = 0.5;
          mat4.multiply(sm, matrix_stack.getModelViewProjectionMatrix());
          
          context.gl.enable(GL_CULL_FACE);
          context.gl.cullFace(GL_FRONT);
          context.gl.disable(GL_BLEND);
          context.gl.enable(GL_POLYGON_OFFSET_FILL);
          context.gl.polygonOffset(2.0, 2.0);
          self.renderWithinRange(context, objects, render_options);
          context.gl.disable(GL_POLYGON_OFFSET_FILL);
          context.gl.enable(GL_BLEND);
          context.gl.cullFace(GL_BACK);
          context.gl.disable(GL_CULL_FACE);
        });
        // restore the original context viewport
        context.gl.viewport(0, 0, context.canvas.width, context.canvas.height);
      });
    }
  });
})();

/*
  Constants used internally when constructing the flat-array format for a light source.
  This is so we don't need to make redundant glUniform() calls to specify the attributes of a single
  light source.
 */
Jax.Scene.LightSource.POSITION              =  1;
Jax.Scene.LightSource.DIRECTION             =  2;
Jax.Scene.LightSource.AMBIENT               =  3;
Jax.Scene.LightSource.DIFFUSE               =  4;
Jax.Scene.LightSource.SPECULAR              =  5;
Jax.Scene.LightSource.CONSTANT_ATTENUATION  =  6;
Jax.Scene.LightSource.LINEAR_ATTENUATION    =  7;
Jax.Scene.LightSource.QUADRATIC_ATTENUATION =  8;
Jax.Scene.LightSource.SPOTLIGHT_EXPONENT    =  9;
Jax.Scene.LightSource.SPOTLIGHT_COS_CUTOFF  = 10;

/* The size of the light source structure, in float elements */
Jax.Scene.LightSource.STRUCT_SIZE = 23;

