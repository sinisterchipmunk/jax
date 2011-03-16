var Jax = { };

/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


/*
 * Provides requestAnimationFrame in a cross browser way.
 */
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000/60);
         };
})();


/* My own custom extensions to Prototype */

/*
  Core functions borrowed from Prototype. I don't think these are stepping on anyone's (e.g. jQuery's) toes,
  but if I find out otherwise I'll have to tweak it. The goal here is to be totally compatible with other libraries
  wherever possible.
*/

Jax.$A = function(iterable) {
  if (!iterable) return [];
  if ('toArray' in Object(iterable)) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
};

/* TODO find a way to avoid polluting Object. */
Object.isFunction = function(arg) { return Object.prototype.toString.call(arg) === '[object Function]'; };
Object.isUndefined = function(object) { return typeof object === "undefined"; };
Object.isArray = function(object) { return Object.prototype.toString.call(object) === '[object Array]'; };
Object.extend = function(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
};

Object.extend(Function.prototype, (function() {
  var slice = Array.prototype.slice;

  function update(array, args) {
    var arrayLength = array.length, length = args.length;
    while (length--) array[arrayLength + length] = args[length];
    return array;
  }

  function merge(array, args) {
    array = slice.call(array, 0);
    return update(array, args);
  }

  function argumentNames() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  }

  function bind(context) {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = slice.call(arguments, 1);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(context, a);
    }
  }

  function bindAsEventListener(context) {
    var __method = this, args = slice.call(arguments, 1);
    return function(event) {
      var a = update([event || window.event], args);
      return __method.apply(context, a);
    }
  }

  function curry() {
    if (!arguments.length) return this;
    var __method = this, args = slice.call(arguments, 0);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(this, a);
    }
  }

  function delay(timeout) {
    var __method = this, args = slice.call(arguments, 1);
    timeout = timeout * 1000;
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  }

  function defer() {
    var args = update([0.01], arguments);
    return this.delay.apply(this, args);
  }

  function wrap(wrapper) {
    var __method = this;
    return function() {
      var a = update([__method.bind(this)], arguments);
      return wrapper.apply(this, a);
    }
  }

  function methodize() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      var a = update([this], arguments);
      return __method.apply(null, a);
    };
  }

  return {
    argumentNames:       argumentNames,
    bind:                bind,
    bindAsEventListener: bindAsEventListener,
    curry:               curry,
    delay:               delay,
    defer:               defer,
    wrap:                wrap,
    methodize:           methodize
  };
})());

Jax.Class = (function() {
  var emptyFunction = function() { };

  var IS_DONTENUM_BUGGY = (function(){
    for (var p in { toString: 1 }) {
      if (p === 'toString') return false;
    }
    return true;
  })();

  function subclass() {};
  function create() {
    var parent = null, properties = Jax.$A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Jax.Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0, length = properties.length; i < length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = emptyFunction;

    klass.prototype.constructor = klass;
    return klass;
  }

  function addMethods(source) {
    var ancestor   = this.superclass && this.superclass.prototype,
        properties = Object.keys(source);

    if (IS_DONTENUM_BUGGY) {
      if (source.toString != Object.prototype.toString)
        properties.push("toString");
      if (source.valueOf != Object.prototype.valueOf)
        properties.push("valueOf");
    }

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames()[0] == "$super") {
        var method = value;
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments); };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }

    return this;
  }

  return {
    create: create,
    Methods: {
      addMethods: addMethods
    }
  };
})();

(function() {
  /*
    Prototype doesn't seem to have a way to add instance methods to all classes (a generic base object would have
    been nice) so we have to hack it in by aliasing ::create and then replacing it.
  */
  Jax.Class.InstanceMethods = {
    isKindOf: function(klass) {
      return(this instanceof klass);
    }
  };

  var original_create = Jax.Class.create;
  Jax.Class.create = function() {
    var klass = original_create.apply(Jax.Class, arguments);
    klass.addMethods(Jax.Class.InstanceMethods);
    return klass;
  };

  /* for adding class methods only */
})();
Jax.ViewHelper = {
  create: function(methods) {
    Jax.View.addMethods(methods);
    return methods;
  }
};
(function() {
  function initProperties(self, data) {
    var attribute;

    if (data) {
      for (attribute in data) {
        switch(attribute) {
          case 'position':    self.camera.setPosition(data[attribute]); break;
          default:
            self[attribute] = data[attribute];
        }
      }
    }
  }

  Jax.Model = (function() {
    return Jax.Class.create({
      initialize: function(data) {
        this.camera = new Jax.Camera();

        if (this._klass && this._klass.resources)
          initProperties(this, this._klass.resources['default']);
        initProperties(this, data);

        if (this.after_initialize) this.after_initialize();
      },

      render: function(context) {
        if (this.mesh)
        {
          var self = this;
          context.pushMatrix(function() {
            context.multMatrix(self.camera.getModelViewMatrix());
            self.mesh.render(context);
          });
        }
      },

      inspect: function() {
        result = {};
        for (var i in this)
          if (!Object.isFunction(this[i]) && i != "_klass")
            result[i] = this[i];
        return JSON.stringify(result);
      }
    });
  })();

  var model_class_methods = {
    find: function(id) {
      for (var resource_id in this.resources) {
        if (id == resource_id)
          return new this(this.resources[id]);
      }
      throw new Error("Resource '"+id+"' not found!");
    },

    addResources: function(resources) {
      this.resources = this.resources || {};
      for (var id in resources)
        if (this.resources[id]) throw new Error("Duplicate resource ID: "+id);
        else this.resources[id] = resources[id];
    }
  };

  Jax.Model.create = function(superclass, inner) {
    var klass;
    if (inner) klass = Jax.Class.create(superclass, inner);
    else       klass = Jax.Class.create(Jax.Model, superclass);

    klass.addMethods({_klass:klass});

    Object.extend(klass, model_class_methods);
    return klass;
  };
})();
(function() {
  var protected_instance_method_names = [
    'initialize', 'toString', 'getControllerName', 'constructor', 'isKindOf', 'fireAction',
    'eraseResult'
  ];

  function is_protected(method_name) {
    for (var i = 0; i < protected_instance_method_names.length; i++)
      if (protected_instance_method_names[i] == method_name)
        return true;
    return false;
  }

  Jax.Controller = (function() {
    function setViewKey(self) {
      self.view_key = self.getControllerName()+"/"+self.action_name;
      self.rendered_or_redirected = true;
    }

    return Jax.Class.create({
      fireAction: function(action_name) {
        this.eraseResult();
        this.action_name = action_name;

        if (this[action_name])
          this[action_name].call(this, []);
        else throw new Error("Call to missing action: '"+action_name+"' in controller '"+this.getControllerName()+"'");

        if (!this.rendered_or_redirected)
          setViewKey(this);
      },

      eraseResult: function() {
        this.rendered_or_redirected = false;
        this.view_key = null;
      }
    });
  })();

  var controller_class_methods = {
    invoke: function(action_name, context) {
      var instance = new this();
      instance.context = context;
      instance.world = context && context.world;
      instance.player = context && context.player;
      instance.fireAction(action_name);
      return instance;
    }
  };

  Jax.Controller.create = function(controller_name, superclass, inner) {
    if (typeof(controller_name) != "string")
    {
      inner = superclass;
      superclass = controller_name;
      controller_name = "generic";
    }

    var klass;
    if (inner) klass = Jax.Class.create(superclass,     inner);
    else       klass = Jax.Class.create(Jax.Controller, superclass);

    Object.extend(klass, controller_class_methods);
    Object.extend(klass, { getControllerName: function() { return controller_name; } });
    klass.addMethods({getControllerName: function() { return controller_name; } });

    for (var method_name in klass.prototype)
    {
      if (!is_protected(method_name)) {
        Jax.routes.map(controller_name+"/"+method_name, klass, method_name);
      }
    }

    return klass;
  };
})();
Jax.ViewManager = (function() {
  return Jax.Class.create({
    initialize: function() {
      this.views = {};
    },

    push: function(path, view) {
      this.views[path] = view;
    },

    get: function(path) {
      if (this.views[path])
        return new Jax.View(this.views[path]);
      else throw new Error("Could not find view at '"+path+"'!");
    },

    find: function(path) { return this.get(path); }
  });
})();
Jax.RouteSet = (function() {
  function set_route(self, path, route_descriptor) {
    return self._map[path] = route_descriptor;
  }

  function find_route(self, path) {
    return self._map[path] || null;
  }

  return Jax.Class.create({
    initialize: function() {
      this.clear();
    },

    clear: function() {
      this._map = {};
    },

    root: function() {
      var args = [];
      for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
      set_route(this, "/", this.getRouteDescriptor.apply(this, args));
    },

    map: function(path) {
      var args = [];
      for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
      set_route(this, path, this.getRouteDescriptor.apply(this, args));
    },

    getRouteDescriptor: function() {
      var route_descriptor;
      switch(arguments.length) {
        case 1:
          if (typeof(arguments[0]) == "object")
          {
            route_descriptor = arguments[0];
            if (!route_descriptor.action) route_descriptor.action = "index";
            return arguments[0];
          }
          else return { controller: arguments[0], action: "index" };
        case 2: return { controller: arguments[0], action: arguments[1] };
        case 3:
          route_descriptor = arguments[3];
          route_descriptor.controller = arguments[0];
          route_descriptor.action = arguments[1];
          return route_descriptor;
        default: throw new Error("Invalid arguments");
      };
    },

    recognize_route: function(path) {
      var route = find_route(this, path);
      if (!route) throw new Error("Route not recognized: '"+path+"'");
      return route;
    },

    isRouted: function(path) {
      return !!find_route(this, path);
    },

    dispatch: function(path, context) {
      var route = this.recognize_route(path);

      return route.controller.invoke(route.action, context);
    }
  });
})();
Jax.View = (function() {
  return Jax.Class.create({
    initialize: function(view_func) {
      this.view_func = view_func;
    },

    render: function() {
      this.view_func();
    }
  });
})();
/*
This file will set up WebGL constants as globals prefixed with GL_, and will add
a new global called GL_METHODS. This will later be used for method delegation
within Jax.Context.
 */

/*
 * glMatrix.js - High performance matrix and vector operations for WebGL
 * version 0.9.5
 */

/*
 * Copyright (c) 2010 Brandon Jones
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */

if(typeof Float32Array != 'undefined') {
	glMatrixArrayType = Float32Array;
} else if(typeof WebGLFloatArray != 'undefined') {
	glMatrixArrayType = WebGLFloatArray; // This is officially deprecated and should dissapear in future revisions.
} else {
	glMatrixArrayType = Array;
}

/*
 * vec3 - 3 Dimensional Vector
 */
var vec3 = {};

/*
 * vec3.create
 * Creates a new instance of a vec3 using the default array type
 * Any javascript array containing at least 3 numeric elements can serve as a vec3
 *
 * Params:
 * vec - Optional, vec3 containing values to initialize with
 *
 * Returns:
 * New vec3
 */
vec3.create = function(vec) {
	var dest = new glMatrixArrayType(3);

	if(vec) {
		dest[0] = vec[0];
		dest[1] = vec[1];
		dest[2] = vec[2];
	}

	return dest;
};

/*
 * vec3.set
 * Copies the values of one vec3 to another
 *
 * Params:
 * vec - vec3 containing values to copy
 * dest - vec3 receiving copied values
 *
 * Returns:
 * dest
 */
vec3.set = function(vec, dest) {
	dest[0] = vec[0];
	dest[1] = vec[1];
	dest[2] = vec[2];

	return dest;
};

/*
 * vec3.add
 * Performs a vector addition
 *
 * Params:
 * vec - vec3, first operand
 * vec2 - vec3, second operand
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.add = function(vec, vec2, dest) {
	if(!dest || vec == dest) {
		vec[0] += vec2[0];
		vec[1] += vec2[1];
		vec[2] += vec2[2];
		return vec;
	}

	dest[0] = vec[0] + vec2[0];
	dest[1] = vec[1] + vec2[1];
	dest[2] = vec[2] + vec2[2];
	return dest;
};

/*
 * vec3.subtract
 * Performs a vector subtraction
 *
 * Params:
 * vec - vec3, first operand
 * vec2 - vec3, second operand
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.subtract = function(vec, vec2, dest) {
	if(!dest || vec == dest) {
		vec[0] -= vec2[0];
		vec[1] -= vec2[1];
		vec[2] -= vec2[2];
		return vec;
	}

	dest[0] = vec[0] - vec2[0];
	dest[1] = vec[1] - vec2[1];
	dest[2] = vec[2] - vec2[2];
	return dest;
};

/*
 * vec3.negate
 * Negates the components of a vec3
 *
 * Params:
 * vec - vec3 to negate
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.negate = function(vec, dest) {
	if(!dest) { dest = vec; }

	dest[0] = -vec[0];
	dest[1] = -vec[1];
	dest[2] = -vec[2];
	return dest;
};

/*
 * vec3.scale
 * Multiplies the components of a vec3 by a scalar value
 *
 * Params:
 * vec - vec3 to scale
 * val - Numeric value to scale by
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.scale = function(vec, val, dest) {
	if(!dest || vec == dest) {
		vec[0] *= val;
		vec[1] *= val;
		vec[2] *= val;
		return vec;
	}

	dest[0] = vec[0]*val;
	dest[1] = vec[1]*val;
	dest[2] = vec[2]*val;
	return dest;
};

/*
 * vec3.normalize
 * Generates a unit vector of the same direction as the provided vec3
 * If vector length is 0, returns [0, 0, 0]
 *
 * Params:
 * vec - vec3 to normalize
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.normalize = function(vec, dest) {
	if(!dest) { dest = vec; }

	var x = vec[0], y = vec[1], z = vec[2];
	var len = Math.sqrt(x*x + y*y + z*z);

	if (!len) {
		dest[0] = 0;
		dest[1] = 0;
		dest[2] = 0;
		return dest;
	} else if (len == 1) {
		dest[0] = x;
		dest[1] = y;
		dest[2] = z;
		return dest;
	}

	len = 1 / len;
	dest[0] = x*len;
	dest[1] = y*len;
	dest[2] = z*len;
	return dest;
};

/*
 * vec3.cross
 * Generates the cross product of two vec3s
 *
 * Params:
 * vec - vec3, first operand
 * vec2 - vec3, second operand
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.cross = function(vec, vec2, dest){
	if(!dest) { dest = vec; }

	var x = vec[0], y = vec[1], z = vec[2];
	var x2 = vec2[0], y2 = vec2[1], z2 = vec2[2];

	dest[0] = y*z2 - z*y2;
	dest[1] = z*x2 - x*z2;
	dest[2] = x*y2 - y*x2;
	return dest;
};

/*
 * vec3.length
 * Caclulates the length of a vec3
 *
 * Params:
 * vec - vec3 to calculate length of
 *
 * Returns:
 * Length of vec
 */
vec3.length = function(vec){
	var x = vec[0], y = vec[1], z = vec[2];
	return Math.sqrt(x*x + y*y + z*z);
};

/*
 * vec3.dot
 * Caclulates the dot product of two vec3s
 *
 * Params:
 * vec - vec3, first operand
 * vec2 - vec3, second operand
 *
 * Returns:
 * Dot product of vec and vec2
 */
vec3.dot = function(vec, vec2){
	return vec[0]*vec2[0] + vec[1]*vec2[1] + vec[2]*vec2[2];
};

/*
 * vec3.direction
 * Generates a unit vector pointing from one vector to another
 *
 * Params:
 * vec - origin vec3
 * vec2 - vec3 to point to
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.direction = function(vec, vec2, dest) {
	if(!dest) { dest = vec; }

	var x = vec[0] - vec2[0];
	var y = vec[1] - vec2[1];
	var z = vec[2] - vec2[2];

	var len = Math.sqrt(x*x + y*y + z*z);
	if (!len) {
		dest[0] = 0;
		dest[1] = 0;
		dest[2] = 0;
		return dest;
	}

	len = 1 / len;
	dest[0] = x * len;
	dest[1] = y * len;
	dest[2] = z * len;
	return dest;
};

/*
 * vec3.lerp
 * Performs a linear interpolation between two vec3
 *
 * Params:
 * vec - vec3, first vector
 * vec2 - vec3, second vector
 * lerp - interpolation amount between the two inputs
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.lerp = function(vec, vec2, lerp, dest){
    if(!dest) { dest = vec; }

    dest[0] = vec[0] + lerp * (vec2[0] - vec[0]);
    dest[1] = vec[1] + lerp * (vec2[1] - vec[1]);
    dest[2] = vec[2] + lerp * (vec2[2] - vec[2]);

    return dest;
}

/*
 * vec3.str
 * Returns a string representation of a vector
 *
 * Params:
 * vec - vec3 to represent as a string
 *
 * Returns:
 * string representation of vec
 */
vec3.str = function(vec) {
	return '[' + vec[0] + ', ' + vec[1] + ', ' + vec[2] + ']';
};

/*
 * mat3 - 3x3 Matrix
 */
var mat3 = {};

/*
 * mat3.create
 * Creates a new instance of a mat3 using the default array type
 * Any javascript array containing at least 9 numeric elements can serve as a mat3
 *
 * Params:
 * mat - Optional, mat3 containing values to initialize with
 *
 * Returns:
 * New mat3
 */
mat3.create = function(mat) {
	var dest = new glMatrixArrayType(9);

	if(mat) {
		dest[0] = mat[0];
		dest[1] = mat[1];
		dest[2] = mat[2];
		dest[3] = mat[3];
		dest[4] = mat[4];
		dest[5] = mat[5];
		dest[6] = mat[6];
		dest[7] = mat[7];
		dest[8] = mat[8];
		dest[9] = mat[9];
	}

	return dest;
};

/*
 * mat3.set
 * Copies the values of one mat3 to another
 *
 * Params:
 * mat - mat3 containing values to copy
 * dest - mat3 receiving copied values
 *
 * Returns:
 * dest
 */
mat3.set = function(mat, dest) {
	dest[0] = mat[0];
	dest[1] = mat[1];
	dest[2] = mat[2];
	dest[3] = mat[3];
	dest[4] = mat[4];
	dest[5] = mat[5];
	dest[6] = mat[6];
	dest[7] = mat[7];
	dest[8] = mat[8];
	return dest;
};

/*
 * mat3.identity
 * Sets a mat3 to an identity matrix
 *
 * Params:
 * dest - mat3 to set
 *
 * Returns:
 * dest
 */
mat3.identity = function(dest) {
	dest[0] = 1;
	dest[1] = 0;
	dest[2] = 0;
	dest[3] = 0;
	dest[4] = 1;
	dest[5] = 0;
	dest[6] = 0;
	dest[7] = 0;
	dest[8] = 1;
	return dest;
};

/*
 * mat4.transpose
 * Transposes a mat3 (flips the values over the diagonal)
 *
 * Params:
 * mat - mat3 to transpose
 * dest - Optional, mat3 receiving transposed values. If not specified result is written to mat
 *
 * Returns:
 * dest is specified, mat otherwise
 */
mat3.transpose = function(mat, dest) {
	if(!dest || mat == dest) {
		var a01 = mat[1], a02 = mat[2];
		var a12 = mat[5];

        mat[1] = mat[3];
        mat[2] = mat[6];
        mat[3] = a01;
        mat[5] = mat[7];
        mat[6] = a02;
        mat[7] = a12;
		return mat;
	}

	dest[0] = mat[0];
	dest[1] = mat[3];
	dest[2] = mat[6];
	dest[3] = mat[1];
	dest[4] = mat[4];
	dest[5] = mat[7];
	dest[6] = mat[2];
	dest[7] = mat[5];
	dest[8] = mat[8];
	return dest;
};

/*
 * mat3.toMat4
 * Copies the elements of a mat3 into the upper 3x3 elements of a mat4
 *
 * Params:
 * mat - mat3 containing values to copy
 * dest - Optional, mat4 receiving copied values
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 */
mat3.toMat4 = function(mat, dest) {
	if(!dest) { dest = mat4.create(); }

	dest[0] = mat[0];
	dest[1] = mat[1];
	dest[2] = mat[2];
	dest[3] = 0;

	dest[4] = mat[3];
	dest[5] = mat[4];
	dest[6] = mat[5];
	dest[7] = 0;

	dest[8] = mat[6];
	dest[9] = mat[7];
	dest[10] = mat[8];
	dest[11] = 0;

	dest[12] = 0;
	dest[13] = 0;
	dest[14] = 0;
	dest[15] = 1;

	return dest;
}

/*
 * mat3.str
 * Returns a string representation of a mat3
 *
 * Params:
 * mat - mat3 to represent as a string
 *
 * Returns:
 * string representation of mat
 */
mat3.str = function(mat) {
	return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] +
		', ' + mat[3] + ', '+ mat[4] + ', ' + mat[5] +
		', ' + mat[6] + ', ' + mat[7] + ', '+ mat[8] + ']';
};

/*
 * mat4 - 4x4 Matrix
 */
var mat4 = {};

/*
 * mat4.create
 * Creates a new instance of a mat4 using the default array type
 * Any javascript array containing at least 16 numeric elements can serve as a mat4
 *
 * Params:
 * mat - Optional, mat4 containing values to initialize with
 *
 * Returns:
 * New mat4
 */
mat4.create = function(mat) {
	var dest = new glMatrixArrayType(16);

	if(mat) {
		dest[0] = mat[0];
		dest[1] = mat[1];
		dest[2] = mat[2];
		dest[3] = mat[3];
		dest[4] = mat[4];
		dest[5] = mat[5];
		dest[6] = mat[6];
		dest[7] = mat[7];
		dest[8] = mat[8];
		dest[9] = mat[9];
		dest[10] = mat[10];
		dest[11] = mat[11];
		dest[12] = mat[12];
		dest[13] = mat[13];
		dest[14] = mat[14];
		dest[15] = mat[15];
	}

	return dest;
};

/*
 * mat4.set
 * Copies the values of one mat4 to another
 *
 * Params:
 * mat - mat4 containing values to copy
 * dest - mat4 receiving copied values
 *
 * Returns:
 * dest
 */
mat4.set = function(mat, dest) {
	dest[0] = mat[0];
	dest[1] = mat[1];
	dest[2] = mat[2];
	dest[3] = mat[3];
	dest[4] = mat[4];
	dest[5] = mat[5];
	dest[6] = mat[6];
	dest[7] = mat[7];
	dest[8] = mat[8];
	dest[9] = mat[9];
	dest[10] = mat[10];
	dest[11] = mat[11];
	dest[12] = mat[12];
	dest[13] = mat[13];
	dest[14] = mat[14];
	dest[15] = mat[15];
	return dest;
};

/*
 * mat4.identity
 * Sets a mat4 to an identity matrix
 *
 * Params:
 * dest - mat4 to set
 *
 * Returns:
 * dest
 */
mat4.identity = function(dest) {
	dest[0] = 1;
	dest[1] = 0;
	dest[2] = 0;
	dest[3] = 0;
	dest[4] = 0;
	dest[5] = 1;
	dest[6] = 0;
	dest[7] = 0;
	dest[8] = 0;
	dest[9] = 0;
	dest[10] = 1;
	dest[11] = 0;
	dest[12] = 0;
	dest[13] = 0;
	dest[14] = 0;
	dest[15] = 1;
	return dest;
};

/*
 * mat4.transpose
 * Transposes a mat4 (flips the values over the diagonal)
 *
 * Params:
 * mat - mat4 to transpose
 * dest - Optional, mat4 receiving transposed values. If not specified result is written to mat
 *
 * Returns:
 * dest is specified, mat otherwise
 */
mat4.transpose = function(mat, dest) {
	if(!dest || mat == dest) {
		var a01 = mat[1], a02 = mat[2], a03 = mat[3];
		var a12 = mat[6], a13 = mat[7];
		var a23 = mat[11];

		mat[1] = mat[4];
		mat[2] = mat[8];
		mat[3] = mat[12];
		mat[4] = a01;
		mat[6] = mat[9];
		mat[7] = mat[13];
		mat[8] = a02;
		mat[9] = a12;
		mat[11] = mat[14];
		mat[12] = a03;
		mat[13] = a13;
		mat[14] = a23;
		return mat;
	}

	dest[0] = mat[0];
	dest[1] = mat[4];
	dest[2] = mat[8];
	dest[3] = mat[12];
	dest[4] = mat[1];
	dest[5] = mat[5];
	dest[6] = mat[9];
	dest[7] = mat[13];
	dest[8] = mat[2];
	dest[9] = mat[6];
	dest[10] = mat[10];
	dest[11] = mat[14];
	dest[12] = mat[3];
	dest[13] = mat[7];
	dest[14] = mat[11];
	dest[15] = mat[15];
	return dest;
};

/*
 * mat4.determinant
 * Calculates the determinant of a mat4
 *
 * Params:
 * mat - mat4 to calculate determinant of
 *
 * Returns:
 * determinant of mat
 */
mat4.determinant = function(mat) {
	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
	var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];

	return	a30*a21*a12*a03 - a20*a31*a12*a03 - a30*a11*a22*a03 + a10*a31*a22*a03 +
			a20*a11*a32*a03 - a10*a21*a32*a03 - a30*a21*a02*a13 + a20*a31*a02*a13 +
			a30*a01*a22*a13 - a00*a31*a22*a13 - a20*a01*a32*a13 + a00*a21*a32*a13 +
			a30*a11*a02*a23 - a10*a31*a02*a23 - a30*a01*a12*a23 + a00*a31*a12*a23 +
			a10*a01*a32*a23 - a00*a11*a32*a23 - a20*a11*a02*a33 + a10*a21*a02*a33 +
			a20*a01*a12*a33 - a00*a21*a12*a33 - a10*a01*a22*a33 + a00*a11*a22*a33;
};

/*
 * mat4.inverse
 * Calculates the inverse matrix of a mat4
 *
 * Params:
 * mat - mat4 to calculate inverse of
 * dest - Optional, mat4 receiving inverse matrix. If not specified result is written to mat
 *
 * Returns:
 * dest is specified, mat otherwise
 */
mat4.inverse = function(mat, dest) {
	if(!dest) { dest = mat; }

	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
	var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];

	var b00 = a00*a11 - a01*a10;
	var b01 = a00*a12 - a02*a10;
	var b02 = a00*a13 - a03*a10;
	var b03 = a01*a12 - a02*a11;
	var b04 = a01*a13 - a03*a11;
	var b05 = a02*a13 - a03*a12;
	var b06 = a20*a31 - a21*a30;
	var b07 = a20*a32 - a22*a30;
	var b08 = a20*a33 - a23*a30;
	var b09 = a21*a32 - a22*a31;
	var b10 = a21*a33 - a23*a31;
	var b11 = a22*a33 - a23*a32;

	var invDet = 1/(b00*b11 - b01*b10 + b02*b09 + b03*b08 - b04*b07 + b05*b06);

	dest[0] = (a11*b11 - a12*b10 + a13*b09)*invDet;
	dest[1] = (-a01*b11 + a02*b10 - a03*b09)*invDet;
	dest[2] = (a31*b05 - a32*b04 + a33*b03)*invDet;
	dest[3] = (-a21*b05 + a22*b04 - a23*b03)*invDet;
	dest[4] = (-a10*b11 + a12*b08 - a13*b07)*invDet;
	dest[5] = (a00*b11 - a02*b08 + a03*b07)*invDet;
	dest[6] = (-a30*b05 + a32*b02 - a33*b01)*invDet;
	dest[7] = (a20*b05 - a22*b02 + a23*b01)*invDet;
	dest[8] = (a10*b10 - a11*b08 + a13*b06)*invDet;
	dest[9] = (-a00*b10 + a01*b08 - a03*b06)*invDet;
	dest[10] = (a30*b04 - a31*b02 + a33*b00)*invDet;
	dest[11] = (-a20*b04 + a21*b02 - a23*b00)*invDet;
	dest[12] = (-a10*b09 + a11*b07 - a12*b06)*invDet;
	dest[13] = (a00*b09 - a01*b07 + a02*b06)*invDet;
	dest[14] = (-a30*b03 + a31*b01 - a32*b00)*invDet;
	dest[15] = (a20*b03 - a21*b01 + a22*b00)*invDet;

	return dest;
};

/*
 * mat4.toRotationMat
 * Copies the upper 3x3 elements of a mat4 into another mat4
 *
 * Params:
 * mat - mat4 containing values to copy
 * dest - Optional, mat4 receiving copied values
 *
 * Returns:
 * dest is specified, a new mat4 otherwise
 */
mat4.toRotationMat = function(mat, dest) {
	if(!dest) { dest = mat4.create(); }

	dest[0] = mat[0];
	dest[1] = mat[1];
	dest[2] = mat[2];
	dest[3] = mat[3];
	dest[4] = mat[4];
	dest[5] = mat[5];
	dest[6] = mat[6];
	dest[7] = mat[7];
	dest[8] = mat[8];
	dest[9] = mat[9];
	dest[10] = mat[10];
	dest[11] = mat[11];
	dest[12] = 0;
	dest[13] = 0;
	dest[14] = 0;
	dest[15] = 1;

	return dest;
};

/*
 * mat4.toMat3
 * Copies the upper 3x3 elements of a mat4 into a mat3
 *
 * Params:
 * mat - mat4 containing values to copy
 * dest - Optional, mat3 receiving copied values
 *
 * Returns:
 * dest is specified, a new mat3 otherwise
 */
mat4.toMat3 = function(mat, dest) {
	if(!dest) { dest = mat3.create(); }

	dest[0] = mat[0];
	dest[1] = mat[1];
	dest[2] = mat[2];
	dest[3] = mat[4];
	dest[4] = mat[5];
	dest[5] = mat[6];
	dest[6] = mat[8];
	dest[7] = mat[9];
	dest[8] = mat[10];

	return dest;
};

/*
 * mat4.toInverseMat3
 * Calculates the inverse of the upper 3x3 elements of a mat4 and copies the result into a mat3
 * The resulting matrix is useful for calculating transformed normals
 *
 * Params:
 * mat - mat4 containing values to invert and copy
 * dest - Optional, mat3 receiving values
 *
 * Returns:
 * dest is specified, a new mat3 otherwise
 */
mat4.toInverseMat3 = function(mat, dest) {
	var a00 = mat[0], a01 = mat[1], a02 = mat[2];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10];

	var b01 = a22*a11-a12*a21;
	var b11 = -a22*a10+a12*a20;
	var b21 = a21*a10-a11*a20;

	var d = a00*b01 + a01*b11 + a02*b21;
	if (!d) { return null; }
	var id = 1/d;

	if(!dest) { dest = mat3.create(); }

	dest[0] = b01*id;
	dest[1] = (-a22*a01 + a02*a21)*id;
	dest[2] = (a12*a01 - a02*a11)*id;
	dest[3] = b11*id;
	dest[4] = (a22*a00 - a02*a20)*id;
	dest[5] = (-a12*a00 + a02*a10)*id;
	dest[6] = b21*id;
	dest[7] = (-a21*a00 + a01*a20)*id;
	dest[8] = (a11*a00 - a01*a10)*id;

	return dest;
};

/*
 * mat4.multiply
 * Performs a matrix multiplication
 *
 * Params:
 * mat - mat4, first operand
 * mat2 - mat4, second operand
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.multiply = function(mat, mat2, dest) {
	if(!dest) { dest = mat }

	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
	var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];

	var b00 = mat2[0], b01 = mat2[1], b02 = mat2[2], b03 = mat2[3];
	var b10 = mat2[4], b11 = mat2[5], b12 = mat2[6], b13 = mat2[7];
	var b20 = mat2[8], b21 = mat2[9], b22 = mat2[10], b23 = mat2[11];
	var b30 = mat2[12], b31 = mat2[13], b32 = mat2[14], b33 = mat2[15];

	dest[0] = b00*a00 + b01*a10 + b02*a20 + b03*a30;
	dest[1] = b00*a01 + b01*a11 + b02*a21 + b03*a31;
	dest[2] = b00*a02 + b01*a12 + b02*a22 + b03*a32;
	dest[3] = b00*a03 + b01*a13 + b02*a23 + b03*a33;
	dest[4] = b10*a00 + b11*a10 + b12*a20 + b13*a30;
	dest[5] = b10*a01 + b11*a11 + b12*a21 + b13*a31;
	dest[6] = b10*a02 + b11*a12 + b12*a22 + b13*a32;
	dest[7] = b10*a03 + b11*a13 + b12*a23 + b13*a33;
	dest[8] = b20*a00 + b21*a10 + b22*a20 + b23*a30;
	dest[9] = b20*a01 + b21*a11 + b22*a21 + b23*a31;
	dest[10] = b20*a02 + b21*a12 + b22*a22 + b23*a32;
	dest[11] = b20*a03 + b21*a13 + b22*a23 + b23*a33;
	dest[12] = b30*a00 + b31*a10 + b32*a20 + b33*a30;
	dest[13] = b30*a01 + b31*a11 + b32*a21 + b33*a31;
	dest[14] = b30*a02 + b31*a12 + b32*a22 + b33*a32;
	dest[15] = b30*a03 + b31*a13 + b32*a23 + b33*a33;

	return dest;
};

/*
 * mat4.multiplyVec3
 * Transforms a vec3 with the given matrix
 * 4th vector component is implicitly '1'
 *
 * Params:
 * mat - mat4 to transform the vector with
 * vec - vec3 to transform
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
mat4.multiplyVec3 = function(mat, vec, dest) {
	if(!dest) { dest = vec }

	var x = vec[0], y = vec[1], z = vec[2];

	dest[0] = mat[0]*x + mat[4]*y + mat[8]*z + mat[12];
	dest[1] = mat[1]*x + mat[5]*y + mat[9]*z + mat[13];
	dest[2] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14];

	return dest;
};

/*
 * mat4.multiplyVec4
 * Transforms a vec4 with the given matrix
 *
 * Params:
 * mat - mat4 to transform the vector with
 * vec - vec4 to transform
 * dest - Optional, vec4 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
mat4.multiplyVec4 = function(mat, vec, dest) {
	if(!dest) { dest = vec }

	var x = vec[0], y = vec[1], z = vec[2], w = vec[3];

	dest[0] = mat[0]*x + mat[4]*y + mat[8]*z + mat[12]*w;
	dest[1] = mat[1]*x + mat[5]*y + mat[9]*z + mat[13]*w;
	dest[2] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14]*w;
	dest[3] = mat[3]*x + mat[7]*y + mat[11]*z + mat[15]*w;

	return dest;
};

/*
 * mat4.translate
 * Translates a matrix by the given vector
 *
 * Params:
 * mat - mat4 to translate
 * vec - vec3 specifying the translation
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.translate = function(mat, vec, dest) {
	var x = vec[0], y = vec[1], z = vec[2];

	if(!dest || mat == dest) {
		mat[12] = mat[0]*x + mat[4]*y + mat[8]*z + mat[12];
		mat[13] = mat[1]*x + mat[5]*y + mat[9]*z + mat[13];
		mat[14] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14];
		mat[15] = mat[3]*x + mat[7]*y + mat[11]*z + mat[15];
		return mat;
	}

	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];

	dest[0] = a00;
	dest[1] = a01;
	dest[2] = a02;
	dest[3] = a03;
	dest[4] = a10;
	dest[5] = a11;
	dest[6] = a12;
	dest[7] = a13;
	dest[8] = a20;
	dest[9] = a21;
	dest[10] = a22;
	dest[11] = a23;

	dest[12] = a00*x + a10*y + a20*z + mat[12];
	dest[13] = a01*x + a11*y + a21*z + mat[13];
	dest[14] = a02*x + a12*y + a22*z + mat[14];
	dest[15] = a03*x + a13*y + a23*z + mat[15];
	return dest;
};

/*
 * mat4.scale
 * Scales a matrix by the given vector
 *
 * Params:
 * mat - mat4 to scale
 * vec - vec3 specifying the scale for each axis
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.scale = function(mat, vec, dest) {
	var x = vec[0], y = vec[1], z = vec[2];

	if(!dest || mat == dest) {
		mat[0] *= x;
		mat[1] *= x;
		mat[2] *= x;
		mat[3] *= x;
		mat[4] *= y;
		mat[5] *= y;
		mat[6] *= y;
		mat[7] *= y;
		mat[8] *= z;
		mat[9] *= z;
		mat[10] *= z;
		mat[11] *= z;
		return mat;
	}

	dest[0] = mat[0]*x;
	dest[1] = mat[1]*x;
	dest[2] = mat[2]*x;
	dest[3] = mat[3]*x;
	dest[4] = mat[4]*y;
	dest[5] = mat[5]*y;
	dest[6] = mat[6]*y;
	dest[7] = mat[7]*y;
	dest[8] = mat[8]*z;
	dest[9] = mat[9]*z;
	dest[10] = mat[10]*z;
	dest[11] = mat[11]*z;
	dest[12] = mat[12];
	dest[13] = mat[13];
	dest[14] = mat[14];
	dest[15] = mat[15];
	return dest;
};

/*
 * mat4.rotate
 * Rotates a matrix by the given angle around the specified axis
 * If rotating around a primary axis (X,Y,Z) one of the specialized rotation functions should be used instead for performance
 *
 * Params:
 * mat - mat4 to rotate
 * angle - angle (in radians) to rotate
 * axis - vec3 representing the axis to rotate around
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.rotate = function(mat, angle, axis, dest) {
	var x = axis[0], y = axis[1], z = axis[2];
	var len = Math.sqrt(x*x + y*y + z*z);
	if (!len) { return null; }
	if (len != 1) {
		len = 1 / len;
		x *= len;
		y *= len;
		z *= len;
	}

	var s = Math.sin(angle);
	var c = Math.cos(angle);
	var t = 1-c;

	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];

	var b00 = x*x*t + c, b01 = y*x*t + z*s, b02 = z*x*t - y*s;
	var b10 = x*y*t - z*s, b11 = y*y*t + c, b12 = z*y*t + x*s;
	var b20 = x*z*t + y*s, b21 = y*z*t - x*s, b22 = z*z*t + c;

	if(!dest) {
		dest = mat
	} else if(mat != dest) { // If the source and destination differ, copy the unchanged last row
		dest[12] = mat[12];
		dest[13] = mat[13];
		dest[14] = mat[14];
		dest[15] = mat[15];
	}

	dest[0] = a00*b00 + a10*b01 + a20*b02;
	dest[1] = a01*b00 + a11*b01 + a21*b02;
	dest[2] = a02*b00 + a12*b01 + a22*b02;
	dest[3] = a03*b00 + a13*b01 + a23*b02;

	dest[4] = a00*b10 + a10*b11 + a20*b12;
	dest[5] = a01*b10 + a11*b11 + a21*b12;
	dest[6] = a02*b10 + a12*b11 + a22*b12;
	dest[7] = a03*b10 + a13*b11 + a23*b12;

	dest[8] = a00*b20 + a10*b21 + a20*b22;
	dest[9] = a01*b20 + a11*b21 + a21*b22;
	dest[10] = a02*b20 + a12*b21 + a22*b22;
	dest[11] = a03*b20 + a13*b21 + a23*b22;
	return dest;
};

/*
 * mat4.rotateX
 * Rotates a matrix by the given angle around the X axis
 *
 * Params:
 * mat - mat4 to rotate
 * angle - angle (in radians) to rotate
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.rotateX = function(mat, angle, dest) {
	var s = Math.sin(angle);
	var c = Math.cos(angle);

	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];

	if(!dest) {
		dest = mat
	} else if(mat != dest) { // If the source and destination differ, copy the unchanged rows
		dest[0] = mat[0];
		dest[1] = mat[1];
		dest[2] = mat[2];
		dest[3] = mat[3];

		dest[12] = mat[12];
		dest[13] = mat[13];
		dest[14] = mat[14];
		dest[15] = mat[15];
	}

	dest[4] = a10*c + a20*s;
	dest[5] = a11*c + a21*s;
	dest[6] = a12*c + a22*s;
	dest[7] = a13*c + a23*s;

	dest[8] = a10*-s + a20*c;
	dest[9] = a11*-s + a21*c;
	dest[10] = a12*-s + a22*c;
	dest[11] = a13*-s + a23*c;
	return dest;
};

/*
 * mat4.rotateY
 * Rotates a matrix by the given angle around the Y axis
 *
 * Params:
 * mat - mat4 to rotate
 * angle - angle (in radians) to rotate
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.rotateY = function(mat, angle, dest) {
	var s = Math.sin(angle);
	var c = Math.cos(angle);

	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];

	if(!dest) {
		dest = mat
	} else if(mat != dest) { // If the source and destination differ, copy the unchanged rows
		dest[4] = mat[4];
		dest[5] = mat[5];
		dest[6] = mat[6];
		dest[7] = mat[7];

		dest[12] = mat[12];
		dest[13] = mat[13];
		dest[14] = mat[14];
		dest[15] = mat[15];
	}

	dest[0] = a00*c + a20*-s;
	dest[1] = a01*c + a21*-s;
	dest[2] = a02*c + a22*-s;
	dest[3] = a03*c + a23*-s;

	dest[8] = a00*s + a20*c;
	dest[9] = a01*s + a21*c;
	dest[10] = a02*s + a22*c;
	dest[11] = a03*s + a23*c;
	return dest;
};

/*
 * mat4.rotateZ
 * Rotates a matrix by the given angle around the Z axis
 *
 * Params:
 * mat - mat4 to rotate
 * angle - angle (in radians) to rotate
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.rotateZ = function(mat, angle, dest) {
	var s = Math.sin(angle);
	var c = Math.cos(angle);

	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];

	if(!dest) {
		dest = mat
	} else if(mat != dest) { // If the source and destination differ, copy the unchanged last row
		dest[8] = mat[8];
		dest[9] = mat[9];
		dest[10] = mat[10];
		dest[11] = mat[11];

		dest[12] = mat[12];
		dest[13] = mat[13];
		dest[14] = mat[14];
		dest[15] = mat[15];
	}

	dest[0] = a00*c + a10*s;
	dest[1] = a01*c + a11*s;
	dest[2] = a02*c + a12*s;
	dest[3] = a03*c + a13*s;

	dest[4] = a00*-s + a10*c;
	dest[5] = a01*-s + a11*c;
	dest[6] = a02*-s + a12*c;
	dest[7] = a03*-s + a13*c;

	return dest;
};

/*
 * mat4.frustum
 * Generates a frustum matrix with the given bounds
 *
 * Params:
 * left, right - scalar, left and right bounds of the frustum
 * bottom, top - scalar, bottom and top bounds of the frustum
 * near, far - scalar, near and far bounds of the frustum
 * dest - Optional, mat4 frustum matrix will be written into
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 */
mat4.frustum = function(left, right, bottom, top, near, far, dest) {
	if(!dest) { dest = mat4.create(); }
	var rl = (right - left);
	var tb = (top - bottom);
	var fn = (far - near);
	dest[0] = (near*2) / rl;
	dest[1] = 0;
	dest[2] = 0;
	dest[3] = 0;
	dest[4] = 0;
	dest[5] = (near*2) / tb;
	dest[6] = 0;
	dest[7] = 0;
	dest[8] = (right + left) / rl;
	dest[9] = (top + bottom) / tb;
	dest[10] = -(far + near) / fn;
	dest[11] = -1;
	dest[12] = 0;
	dest[13] = 0;
	dest[14] = -(far*near*2) / fn;
	dest[15] = 0;
	return dest;
};

/*
 * mat4.perspective
 * Generates a perspective projection matrix with the given bounds
 *
 * Params:
 * fovy - scalar, vertical field of view
 * aspect - scalar, aspect ratio. typically viewport width/height
 * near, far - scalar, near and far bounds of the frustum
 * dest - Optional, mat4 frustum matrix will be written into
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 */
mat4.perspective = function(fovy, aspect, near, far, dest) {
	var top = near*Math.tan(fovy*Math.PI / 360.0);
	var right = top*aspect;
	return mat4.frustum(-right, right, -top, top, near, far, dest);
};

/*
 * mat4.ortho
 * Generates a orthogonal projection matrix with the given bounds
 *
 * Params:
 * left, right - scalar, left and right bounds of the frustum
 * bottom, top - scalar, bottom and top bounds of the frustum
 * near, far - scalar, near and far bounds of the frustum
 * dest - Optional, mat4 frustum matrix will be written into
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 */
mat4.ortho = function(left, right, bottom, top, near, far, dest) {
	if(!dest) { dest = mat4.create(); }
	var rl = (right - left);
	var tb = (top - bottom);
	var fn = (far - near);
	dest[0] = 2 / rl;
	dest[1] = 0;
	dest[2] = 0;
	dest[3] = 0;
	dest[4] = 0;
	dest[5] = 2 / tb;
	dest[6] = 0;
	dest[7] = 0;
	dest[8] = 0;
	dest[9] = 0;
	dest[10] = -2 / fn;
	dest[11] = 0;
	dest[12] = -(left + right) / rl;
	dest[13] = -(top + bottom) / tb;
	dest[14] = -(far + near) / fn;
	dest[15] = 1;
	return dest;
};

/*
 * mat4.ortho
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * Params:
 * eye - vec3, position of the viewer
 * center - vec3, point the viewer is looking at
 * up - vec3 pointing "up"
 * dest - Optional, mat4 frustum matrix will be written into
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 */
mat4.lookAt = function(eye, center, up, dest) {
	if(!dest) { dest = mat4.create(); }

	var eyex = eye[0],
		eyey = eye[1],
		eyez = eye[2],
		upx = up[0],
		upy = up[1],
		upz = up[2],
		centerx = center[0],
		centery = center[1],
		centerz = center[2];

	if (eyex == centerx && eyey == centery && eyez == centerz) {
		return mat4.identity(dest);
	}

	var z0,z1,z2,x0,x1,x2,y0,y1,y2,len;

	z0 = eyex - center[0];
	z1 = eyey - center[1];
	z2 = eyez - center[2];

	len = 1/Math.sqrt(z0*z0 + z1*z1 + z2*z2);
	z0 *= len;
	z1 *= len;
	z2 *= len;

	x0 = upy*z2 - upz*z1;
	x1 = upz*z0 - upx*z2;
	x2 = upx*z1 - upy*z0;
	len = Math.sqrt(x0*x0 + x1*x1 + x2*x2);
	if (!len) {
		x0 = 0;
		x1 = 0;
		x2 = 0;
	} else {
		len = 1/len;
		x0 *= len;
		x1 *= len;
		x2 *= len;
	};

	y0 = z1*x2 - z2*x1;
	y1 = z2*x0 - z0*x2;
	y2 = z0*x1 - z1*x0;

	len = Math.sqrt(y0*y0 + y1*y1 + y2*y2);
	if (!len) {
		y0 = 0;
		y1 = 0;
		y2 = 0;
	} else {
		len = 1/len;
		y0 *= len;
		y1 *= len;
		y2 *= len;
	}

	dest[0] = x0;
	dest[1] = y0;
	dest[2] = z0;
	dest[3] = 0;
	dest[4] = x1;
	dest[5] = y1;
	dest[6] = z1;
	dest[7] = 0;
	dest[8] = x2;
	dest[9] = y2;
	dest[10] = z2;
	dest[11] = 0;
	dest[12] = -(x0*eyex + x1*eyey + x2*eyez);
	dest[13] = -(y0*eyex + y1*eyey + y2*eyez);
	dest[14] = -(z0*eyex + z1*eyey + z2*eyez);
	dest[15] = 1;

	return dest;
};

/*
 * mat4.str
 * Returns a string representation of a mat4
 *
 * Params:
 * mat - mat4 to represent as a string
 *
 * Returns:
 * string representation of mat
 */
mat4.str = function(mat) {
	return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] + ', ' + mat[3] +
		', '+ mat[4] + ', ' + mat[5] + ', ' + mat[6] + ', ' + mat[7] +
		', '+ mat[8] + ', ' + mat[9] + ', ' + mat[10] + ', ' + mat[11] +
		', '+ mat[12] + ', ' + mat[13] + ', ' + mat[14] + ', ' + mat[15] + ']';
};

/*
 * quat4 - Quaternions
 */
quat4 = {};

/*
 * quat4.create
 * Creates a new instance of a quat4 using the default array type
 * Any javascript array containing at least 4 numeric elements can serve as a quat4
 *
 * Params:
 * quat - Optional, quat4 containing values to initialize with
 *
 * Returns:
 * New quat4
 */
quat4.create = function(quat) {
	var dest = new glMatrixArrayType(4);

	if(quat) {
		dest[0] = quat[0];
		dest[1] = quat[1];
		dest[2] = quat[2];
		dest[3] = quat[3];
	}

	return dest;
};

/*
 * quat4.set
 * Copies the values of one quat4 to another
 *
 * Params:
 * quat - quat4 containing values to copy
 * dest - quat4 receiving copied values
 *
 * Returns:
 * dest
 */
quat4.set = function(quat, dest) {
	dest[0] = quat[0];
	dest[1] = quat[1];
	dest[2] = quat[2];
	dest[3] = quat[3];

	return dest;
};

/*
 * quat4.calculateW
 * Calculates the W component of a quat4 from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * Params:
 * quat - quat4 to calculate W component of
 * dest - Optional, quat4 receiving calculated values. If not specified result is written to quat
 *
 * Returns:
 * dest if specified, quat otherwise
 */
quat4.calculateW = function(quat, dest) {
	var x = quat[0], y = quat[1], z = quat[2];

	if(!dest || quat == dest) {
		quat[3] = -Math.sqrt(Math.abs(1.0 - x*x - y*y - z*z));
		return quat;
	}
	dest[0] = x;
	dest[1] = y;
	dest[2] = z;
	dest[3] = -Math.sqrt(Math.abs(1.0 - x*x - y*y - z*z));
	return dest;
}

/*
 * quat4.inverse
 * Calculates the inverse of a quat4
 *
 * Params:
 * quat - quat4 to calculate inverse of
 * dest - Optional, quat4 receiving inverse values. If not specified result is written to quat
 *
 * Returns:
 * dest if specified, quat otherwise
 */
quat4.inverse = function(quat, dest) {
	if(!dest || quat == dest) {
		quat[0] *= 1;
		quat[1] *= 1;
		quat[2] *= 1;
		return quat;
	}
	dest[0] = -quat[0];
	dest[1] = -quat[1];
	dest[2] = -quat[2];
	dest[3] = quat[3];
	return dest;
}

/*
 * quat4.length
 * Calculates the length of a quat4
 *
 * Params:
 * quat - quat4 to calculate length of
 *
 * Returns:
 * Length of quat
 */
quat4.length = function(quat) {
	var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
	return Math.sqrt(x*x + y*y + z*z + w*w);
}

/*
 * quat4.normalize
 * Generates a unit quaternion of the same direction as the provided quat4
 * If quaternion length is 0, returns [0, 0, 0, 0]
 *
 * Params:
 * quat - quat4 to normalize
 * dest - Optional, quat4 receiving operation result. If not specified result is written to quat
 *
 * Returns:
 * dest if specified, quat otherwise
 */
quat4.normalize = function(quat, dest) {
	if(!dest) { dest = quat; }

	var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
	var len = Math.sqrt(x*x + y*y + z*z + w*w);
	if(len == 0) {
		dest[0] = 0;
		dest[1] = 0;
		dest[2] = 0;
		dest[3] = 0;
		return dest;
	}
	len = 1/len;
	dest[0] = x * len;
	dest[1] = y * len;
	dest[2] = z * len;
	dest[3] = w * len;

	return dest;
}

/*
 * quat4.multiply
 * Performs a quaternion multiplication
 *
 * Params:
 * quat - quat4, first operand
 * quat2 - quat4, second operand
 * dest - Optional, quat4 receiving operation result. If not specified result is written to quat
 *
 * Returns:
 * dest if specified, quat otherwise
 */
quat4.multiply = function(quat, quat2, dest) {
	if(!dest) { dest = quat; }

	var qax = quat[0], qay = quat[1], qaz = quat[2], qaw = quat[3];
	var qbx = quat2[0], qby = quat2[1], qbz = quat2[2], qbw = quat2[3];

	dest[0] = qax*qbw + qaw*qbx + qay*qbz - qaz*qby;
	dest[1] = qay*qbw + qaw*qby + qaz*qbx - qax*qbz;
	dest[2] = qaz*qbw + qaw*qbz + qax*qby - qay*qbx;
	dest[3] = qaw*qbw - qax*qbx - qay*qby - qaz*qbz;

	return dest;
}

/*
 * quat4.multiplyVec3
 * Transforms a vec3 with the given quaternion
 *
 * Params:
 * quat - quat4 to transform the vector with
 * vec - vec3 to transform
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
quat4.multiplyVec3 = function(quat, vec, dest) {
	if(!dest) { dest = vec; }

	var x = vec[0], y = vec[1], z = vec[2];
	var qx = quat[0], qy = quat[1], qz = quat[2], qw = quat[3];

	var ix = qw*x + qy*z - qz*y;
	var iy = qw*y + qz*x - qx*z;
	var iz = qw*z + qx*y - qy*x;
	var iw = -qx*x - qy*y - qz*z;

	dest[0] = ix*qw + iw*-qx + iy*-qz - iz*-qy;
	dest[1] = iy*qw + iw*-qy + iz*-qx - ix*-qz;
	dest[2] = iz*qw + iw*-qz + ix*-qy - iy*-qx;

	return dest;
}

/*
 * quat4.toMat3
 * Calculates a 3x3 matrix from the given quat4
 *
 * Params:
 * quat - quat4 to create matrix from
 * dest - Optional, mat3 receiving operation result
 *
 * Returns:
 * dest if specified, a new mat3 otherwise
 */
quat4.toMat3 = function(quat, dest) {
	if(!dest) { dest = mat3.create(); }

	var x = quat[0], y = quat[1], z = quat[2], w = quat[3];

	var x2 = x + x;
	var y2 = y + y;
	var z2 = z + z;

	var xx = x*x2;
	var xy = x*y2;
	var xz = x*z2;

	var yy = y*y2;
	var yz = y*z2;
	var zz = z*z2;

	var wx = w*x2;
	var wy = w*y2;
	var wz = w*z2;

	dest[0] = 1 - (yy + zz);
	dest[1] = xy - wz;
	dest[2] = xz + wy;

	dest[3] = xy + wz;
	dest[4] = 1 - (xx + zz);
	dest[5] = yz - wx;

	dest[6] = xz - wy;
	dest[7] = yz + wx;
	dest[8] = 1 - (xx + yy);

	return dest;
}

/*
 * quat4.toMat4
 * Calculates a 4x4 matrix from the given quat4
 *
 * Params:
 * quat - quat4 to create matrix from
 * dest - Optional, mat4 receiving operation result
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 */
quat4.toMat4 = function(quat, dest) {
	if(!dest) { dest = mat4.create(); }

	var x = quat[0], y = quat[1], z = quat[2], w = quat[3];

	var x2 = x + x;
	var y2 = y + y;
	var z2 = z + z;

	var xx = x*x2;
	var xy = x*y2;
	var xz = x*z2;

	var yy = y*y2;
	var yz = y*z2;
	var zz = z*z2;

	var wx = w*x2;
	var wy = w*y2;
	var wz = w*z2;

	dest[0] = 1 - (yy + zz);
	dest[1] = xy - wz;
	dest[2] = xz + wy;
	dest[3] = 0;

	dest[4] = xy + wz;
	dest[5] = 1 - (xx + zz);
	dest[6] = yz - wx;
	dest[7] = 0;

	dest[8] = xz - wy;
	dest[9] = yz + wx;
	dest[10] = 1 - (xx + yy);
	dest[11] = 0;

	dest[12] = 0;
	dest[13] = 0;
	dest[14] = 0;
	dest[15] = 1;

	return dest;
}

/*
 * quat4.slerp
 * Performs a spherical linear interpolation between two quat4
 *
 * Params:
 * quat - quat4, first quaternion
 * quat2 - quat4, second quaternion
 * lerp - interpolation amount between the two inputs
 * dest - Optional, quat4 receiving operation result. If not specified result is written to quat
 *
 * Returns:
 * dest if specified, quat otherwise
 */
quat4.slerp = function(quat, quat2, lerp, dest) {
    if(!dest) { dest = quat; }

    var eps_lerp = lerp;

    var dot = quat[0]*quat2[0] + quat[1]*quat2[1] + quat[2]*quat2[2] + quat[3]*quat2[3];
    if (dot < 0.0) {
        eps_lerp = -1.0 * lerp;
    }

    dest[0] = 1.0 - lerp * quat[0] + eps_lerp * quat2[0];
    dest[1] = 1.0 - lerp * quat[1] + eps_lerp * quat2[1];
    dest[2] = 1.0 - lerp * quat[2] + eps_lerp * quat2[2];
    dest[3] = 1.0 - lerp * quat[3] + eps_lerp * quat2[3];

    return dest;
}

/*
 * quat4.str
 * Returns a string representation of a quaternion
 *
 * Params:
 * quat - quat4 to represent as a string
 *
 * Returns:
 * string representation of quat
 */
quat4.str = function(quat) {
	return '[' + quat[0] + ', ' + quat[1] + ', ' + quat[2] + ', ' + quat[3] + ']';
}


window['WEBGL_CONTEXT_NAME'] = "experimental-webgl";
window['GL_METHODS'] = {};

(function() {
  var canvas = document.createElement("canvas");
  canvas.setAttribute("id", "temporary-internal-use");
  canvas.style.display = "block";

  var body = document.getElementsByTagName("body")[0], temporaryBody = false;
  if (!body)
  {
    temporaryBody = true;
    body = document.createElement("body");
    document.getElementsByTagName("html")[0].appendChild(body);
  }
  body.appendChild(canvas);

  var gl = canvas.getContext(WEBGL_CONTEXT_NAME);

  if (gl) {
    for (var method_name in gl)
    {
      if (typeof(gl[method_name]) == "function")
      {
        var camelized_method_name = method_name.substring(1, method_name.length);
        camelized_method_name = "gl" + method_name.substring(0, 1).toUpperCase() + camelized_method_name;

        /* we'll add a layer here to check for render errors */
        var func = "function() {"
                 + "  var result;"
                 + "  try { "
                 + "    result = this.gl."+method_name+".apply(this.gl, arguments);"
                 + ((method_name != "getError") ? "    this.checkForRenderErrors();" : "")
                 + "  } catch(e) { "
                 + "    var args = [], i;"
                 + "    for (i = 0; i < arguments.length; i++) args.push(arguments[i]);"
                 + "    try { args = JSON.stringify(args); } catch(jsonErr) { args = args.toString(); }"
                 + "    if (!e.stack) e = new Error(e.toString());"
                 + (Jax.environment == "production" ? "" : "    alert(e+\"\\n\\n\"+e.stack);")
                 + "    this.handleRenderError('"+method_name+"', args, e);"
                 + "  }"
                 + "  return result;"
                 + "}";

        GL_METHODS[camelized_method_name] = eval("("+func+")");
      }
      else
      {
        /* define the GL enums globally so we don't need a context to reference them */
        if (!/[a-z]/.test(method_name)) // no lowercase letters
          window[('GL_'+method_name)] = gl[method_name];
      }
    }

    /* define some extra globals that the above didn't generate */
    window['GL_MAX_VERTEX_ATTRIBS'] = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    window['GL_DEPTH_COMPONENT'] = gl.DEPTH_COMPONENT || gl.DEPTH_COMPONENT16;
    window['GL_TEXTURES'] = [];
    for (i = 0; i < 32; i++) window['GL_TEXTURES'][i] = gl["TEXTURE"+i];
  }

  /* clean up after ourselves */
  if (temporaryBody)
    body.parentNode.removeChild(body);
})();

/* import other webgl files */

Jax.Shader = (function() {
  function getNormalizedAttribute(self, name) {
    if (!self.attributes) throw new Error("Attributes are undefined!");
    if (!self.attributes[name]) throw new Error("Attribute '"+name+"' is not registered!");

    switch(typeof(self.attributes[name])) {
      case 'object':
        break;
      default:
        self.attributes[name] = { value: self.attributes[name] };
    }
    self.attributes[name].name = self.attributes[name].name || name;
    self.attributes[name].locations = self.attributes[name].locations || {};

    return self.attributes[name];
  }

  function getNormalizedUniform(self, name) {
    if (!self.uniforms) throw new Error("Uniforms are undefined!");
    if (!self.uniforms[name]) throw new Error("Uniform '"+name+"' is not registered!");

    switch(typeof(self.uniforms[name])) {
      case 'object':
        break;
      default:
        self.uniforms[name] = { value: self.uniforms[name] };
    }
    self.uniforms[name].name = self.uniforms[name].name || name;
    self.uniforms[name].locations = self.uniforms[name].locations || {};

    return self.uniforms[name];
  }

  function getUniformLocation(self, context, uniform) {
    if (typeof(uniform.locations[context.id]) != "undefined") return uniform.locations[context.id];
    var program = self.compiled_program[context.id];
    if (!program) throw new Error("Shader program is not compiled!");
    var location = context.glGetUniformLocation(program, uniform.name);
    if (location == -1 || location == null)
      return null;
    return uniform.locations[context.id] = location;
  }

  function getAttributeLocation(self, context, attribute) {
    if (typeof(attribute.locations[context.id]) != "undefined") return attribute.locations[context.id];
    var program = self.compiled_program[context.id];
    if (!program) throw new Error("Shader program is not compiled!");
    var location = context.glGetAttribLocation(program, attribute.name);
    if (location == -1 || location == null) throw new Error("Attribute location for attribute '"+attribute.name+"' could not be found!");
    return attribute.locations[context.id] = location;
  }

  function compile(self, context) {
    var shaderType = self.options.shaderType;

    var builder = Jax.shader_program_builders[self.options.shaderType];
    if (!builder) throw new Error("Could not find shader builder: "+shaderType);
    var sources = builder(self.options);
    if (!sources.vertex_source)   throw new Error("Shader builder '"+shaderType+"' did not return a 'vertex_source' property");
    if (!sources.fragment_source) throw new Error("Shader builder '"+shaderType+"' did not return a 'fragment_source' property");

    if (sources.vertex_source.join)   sources.vertex_source   = sources.vertex_source.join("\n");
    if (sources.fragment_source.join) sources.fragment_source = sources.fragment_source.join("\n");

    sources.fragment_source = "#ifdef GL_ES\nprecision highp float;\n#endif\n" + sources.fragment_source;

    self.uniforms   = sources.uniforms;
    self.attributes = sources.attributes;

    function doCompile(type, source) {
      var shader = context.glCreateShader(type);
      context.glShaderSource(shader, source);
      context.glCompileShader(shader);
      if (!context.glGetShaderParameter(shader, GL_COMPILE_STATUS))
        throw new Error(context.glGetShaderInfoLog(shader));
      return shader;
    }

    var fragmentShader = doCompile(GL_FRAGMENT_SHADER, sources.fragment_source);
    var vertexShader   = doCompile(GL_VERTEX_SHADER,   sources.vertex_source);
    var program = context.glCreateProgram();

    if (vertexShader)   context.glAttachShader(program, vertexShader);
    if (fragmentShader) context.glAttachShader(program, fragmentShader);
    context.glLinkProgram(program);

    if (!context.glGetProgramParameter(program, GL_LINK_STATUS))
      throw new Error("Could not initialize shader!");

    self.compiled_program[context.id] = program;
    self.valid[context.id] = true;
  }

  return Jax.Class.create({
    initialize: function() {
      this.compiled_program = {};
      this.valid = {};
    },

    update: function(options) {
      this.options = options;
      for (var i in this.valid) this.valid[i] = false; // invalidate all contexts
    },

    render: function(context, mesh, options) {
      if (!this.options) throw new Error("Can't compile shader without shader options");
      if (!this.isCompiledFor(context))
        compile(this, context);

      var id;
      context.glUseProgram(this.compiled_program[context.id]);
      for (id in this.attributes) this.setAttribute(context, mesh, getNormalizedAttribute(this, id));
      for (id in this.uniforms)   this.setUniform(  context, mesh, getNormalizedUniform(this, id));

      var buffer;
      if (buffer = mesh.getIndexBuffer())
        context.glDrawElements(options.draw_mode, buffer.length, GL_UNSIGNED_SHORT, 0);
      else if (buffer = mesh.getVertexBuffer())
        context.glDrawArrays(options.draw_mode, 0, buffer.length);
    },

    setAttribute: function(context, mesh, attribute) {
      var value = attribute.value;
      if (typeof(value) == "function") value = value(context, mesh);
      if (value == null || typeof(value) == "undefined") return this.disableAttribute(context, attribute);
      var location = getAttributeLocation(this, context, attribute);

      value.bind(context);
      context.glEnableVertexAttribArray(location);
      context.glVertexAttribPointer(location, value.itemSize, attribute.type || value.type || GL_FLOAT, false, 0, 0);
    },

    setUniform: function(context, mesh, uniform) {
      var value = uniform.value;
      if (typeof(value) == "function") value = value.call(uniform, context, mesh);

      var location = getUniformLocation(this, context, uniform);
      if (!location) return;

      /* TODO perhaps we should only do this matching in development mode. Can it happen in prod? */
      var match;
      if (Object.isArray(value) && (match = /([0-9]+)fv$/.exec(uniform.type)) && (match = match[1]))
      {
        if (match != (value.itemSize ? value.length / value.itemSize : value.length))
          throw new Error("Value "+JSON.stringify(value)+" has "+value.length+" elements (expected "+match+")");
      }

      if (value == null || typeof(value) == "undefined")
        throw new Error("Value is undefined or null for uniform '"+uniform.name+"'!");

      if (!context[uniform.type]) throw new Error("Invalid uniform type: "+uniform.type);
      if (uniform.type.indexOf("glUniformMatrix") != -1) context[uniform.type](location, false, value);
      else                                               context[uniform.type](location,        value);
    },

    disableAttribute: function(context, attribute) {
      context.glDisableVertexAttribArray(getAttributeLocation(this, context, attribute));
    },

    isCompiledFor: function(context) {
      return this.valid[context.id] && !!this.compiled_program[context.id];
    }
  });
})();

Jax.Material = (function() {
  function updatePrevious(self) {
    self.previous = self.previous || {colors:{}};
    for (var i in self.colors)
      self.previous.colors[i] = self.colors[i];
    self.previous.specular    = self.specular;
    self.previous.glossiness  = self.glossiness;
    self.previous.softness    = self.softness;
    self.previous.shaderType  = self.shaderType;
    self.previous.opacity     = self.opacity;
    self.previous.light_count = self.light_count;
  }

  function compile(self, context) {
    self.shader = new Jax.Shader();
    self.shader.update(self);
    updatePrevious(self);
  }

  return Jax.Class.create({
    initialize: function(options) {
      options = options || {};
      options.colors = options.colors || {};

      this.colors = {
        diffuse:  options.colors.diffuse  || [0.8, 0.8, 0.8, 1.0],
        ambient:  options.colors.ambient  || [0.02, 0.02, 0.02, 1.0],
        specular: options.colors.specular || [1.0, 1.0, 1.0, 1.0],
        emissive: options.colors.emissive || [0.0, 0.0, 0.0, 1.0]
      };

      this.specular   = typeof(options.specular)   == "undefined" ?    0    : options.specular;
      this.softness   = typeof(options.softness)   == "undefined" ?    0.1  : options.softness;
      this.glossiness = typeof(options.glossiness) == "undefined" ?   10    : options.glossiness;
      this.opacity    = typeof(options.opacity)    == "undefined" ?    1.0  : options.opacity;
      this.shaderType = typeof(options.shaderType) == "undefined" ? "phong" : options.shaderType;
    },

    render: function(context, mesh, options) {
      this.lights = context.world.lighting._lights;
      this.light_count = context.world.lighting._lights.length;

      if (this.isChanged())
      {
        compile(this, context);
      }
      this.shader.render(context, mesh, options);
    },

    isChanged: function() {
      if (!this.previous) return true;
      var i;
      for (i = 0; i < 3; i++) {
        if (this.colors.diffuse[i]  != this.previous.colors.diffuse[i])  return true;
        if (this.colors.ambient[i]  != this.previous.colors.ambient[i])  return true;
        if (this.colors.specular[i] != this.previous.colors.specular[i]) return true;
        if (this.colors.emissive[i] != this.previous.colors.emissive[i]) return true;
      }

      if (this.specular   != this.previous.specular)   return true;
      if (this.softness   != this.previous.softness)   return true;
      if (this.glossiness != this.previous.glossiness) return true;
      if (this.shaderType != this.previous.shaderType) return true;
      if (this.opacity    != this.previous.opacity)    return true;
      if (this.lights && this.lights.length != this.previous.light_count) return true;
      if (!this.lights && this.previous.light_count) return true;

      return false;
    }
  });
})();

Jax.Material.instances = {};

Jax.Material.find = function(name) {
  var result;
  if (result = Jax.Material.instances[name])
    return result;
  if (Jax.shader_program_builders[name])
    return Jax.Material.create(name, {shaderType:name});
  throw new Error("Material not found: '"+name+"'!");
};

Jax.Material.create = function(name, options) {
  return Jax.Material.instances[name] = new Jax.Material(options);
};

Jax.Material.create('failsafe', {shaderType: 'failsafe'});
Jax.Material.create('default' , {shaderType: 'phong'});
Jax.Buffer = (function() {
  function each_gl_buffer(self, func)
  {
    for (var id in self.gl)
      func(self.gl[id].context, self.gl[id].buffer);
  }

  return Jax.Class.create({
    initialize: function(bufferType, classType, drawType, jsarr, itemSize) {
      if (jsarr.length == 0) throw new Error("No elements in array to be buffered!");
      if (!itemSize) throw new Error("Expected an itemSize - how many JS array elements represent a single buffered element?");
      this.classType = classType;
      this.itemSize = itemSize;
      this.js = jsarr;
      this.gl = {};
      this.numItems = this.length = jsarr.length / itemSize;
      this.bufferType = bufferType;
      this.drawType = drawType;
    },

    refresh: function() {
      var self = this;
      if (self.classTypeInstance)
        for (var i = 0; i < self.js.length; i++)
          self.classTypeInstance[i] = self.js[i];
      else
        self.classTypeInstance = new self.classType(self.js);

      self.numItems = self.length = self.js.length / self.itemSize;
      if (!self.gl) return;

      each_gl_buffer(self, function(context, buffer) {
        buffer.numItems = buffer.length = self.js.length;
        context.glBindBuffer(self.bufferType, buffer);
        context.glBufferData(self.bufferType, self.classTypeInstance, self.drawType);
      });
    },

    dispose: function() {
      var self = this;
      each_gl_buffer(this, function(context, buffer) {
        context.glDeleteBuffer(buffer);
        self.gl[context.id] = null;
      });
      self.gl = {};
    },

    isDisposed: function() { return !this.gl; },

    bind: function(context) { context.glBindBuffer(this.bufferType, this.getGLBuffer(context)); },

    getGLBuffer: function(context)
    {
      if (!context || typeof(context.id) == "undefined")
        throw new Error("Cannot build a buffer without a context!");

      if (!this.gl[context.id])
      {
        var buffer = context.glCreateBuffer();
        buffer.itemSize = this.itemSize;
        this.gl[context.id] = {context:context,buffer:buffer};
        this.refresh();
      }
      return this.gl[context.id].buffer;
    }
  });
})();

Jax.ElementArrayBuffer = Jax.Class.create(Jax.Buffer, {
  initialize: function($super, jsarr) {
    $super(GL_ELEMENT_ARRAY_BUFFER, Uint16Array, GL_STREAM_DRAW, jsarr, 1);
  }
});

Jax.FloatArrayBuffer = Jax.Class.create(Jax.Buffer, {
  initialize: function($super, jsarr, itemSize) {
    $super(GL_ARRAY_BUFFER, Float32Array, GL_STATIC_DRAW, jsarr, itemSize);
  }
});

Jax.VertexBuffer = Jax.Class.create(Jax.FloatArrayBuffer, {
  initialize: function($super, jsarr) { $super(jsarr, 3); }
});

Jax.ColorBuffer = Jax.Class.create(Jax.FloatArrayBuffer, {
  initialize: function($super, jsarr) { $super(jsarr, 4); }
});

Jax.TextureCoordsBuffer = Jax.Class.create(Jax.FloatArrayBuffer, {
  initialize: function($super, jsarr) { $super(jsarr, 2); }
});

Jax.NormalBuffer = Jax.Class.create(Jax.FloatArrayBuffer, {
  initialize: function($super, jsarr) { $super(jsarr, 3); }
});

Jax.Mesh = (function() {
  function setColorCoords(self, count, color, coords) {
    var i, j;
    for (i = 0; i < count; i++)
      for (j = 0; j < color.length; j++)
        coords.push(color[j]);
  }

  function findMaterial(name_or_instance) {
    if (typeof(name_or_instance) == "string")
      return Jax.Material.find(name_or_instance);
    else if (name_or_instance.isKindOf && name_or_instance.isKindOf(Jax.Material))
      return name_or_instance;

    throw new Error("Material must be an instance of Jax.Material, or "+
                    "a string representing a material in the Jax material registry");
  }

  function normalizeRenderOptions(self, options) {
    options = options || {};
    options.material = findMaterial(options.material || self.material);
    options.draw_mode = options.draw_mode || self.draw_mode || GL_TRIANGLES;

    return options;
  }

  function calculateBounds(self, vertices) {
    self.bounds = {left:null,right:null,top:null,bottom:null,front:null,back:null,width:null,height:null,depth:null};
    var i, v;

    for (i = 0; i < vertices.length; i++)
    {
      v = vertices[i];
      if (self.bounds.left  == null || v < self.bounds.left)   self.bounds.left   = v;
      if (self.bounds.right == null || v > self.bounds.right)  self.bounds.right  = v;

      v = vertices[++i];
      if (self.bounds.bottom== null || v < self.bounds.bottom) self.bounds.bottom = v;
      if (self.bounds.top   == null || v > self.bounds.top)    self.bounds.top    = v;

      v = vertices[++i];
      if (self.bounds.front == null || v < self.bounds.front)  self.bounds.front  = v;
      if (self.bounds.back  == null || v > self.bounds.back)   self.bounds.back   = v;
    }

    self.bounds.width = self.bounds.right - self.bounds.left;
    self.bounds.height= self.bounds.top   - self.bounds.bottom;
    self.bounds.depth = self.bounds.front - self.bounds.back;
  }

  function ensureBuilt(self) {
    if (!self.isValid()) self.rebuild();
  }

  return Jax.Class.create({
    initialize: function(options) {
      this.buffers = {};

      this.material = "default";

      for (var i in options)
        this[i] = options[i];
    },

    dispose: function() {
      var buf;
      if (buf = this.buffers.vertex_buffer) buf.dispose();
      if (buf = this.buffers.color_buffer)  buf.dispose();
      if (buf = this.buffers.index_buffer)  buf.dispose();
      if (buf = this.buffers.normal_buffer) buf.dispose();
      this.buffers = {};
      this.built = false;
    },

    render: function(context, options) {
      if (!this.isValid()) this.rebuild();
      options = normalizeRenderOptions(this, options);
      options.material.render(context, this, options);
    },

    getVertexBuffer: function() { ensureBuilt(this); return this.buffers.vertex_buffer; },
    getColorBuffer:  function() { ensureBuilt(this); return this.buffers.color_buffer;  },
    getIndexBuffer:  function() { ensureBuilt(this); return this.buffers.index_buffer;  },
    getNormalBuffer: function() { ensureBuilt(this); return this.buffers.normal_buffer; },

    isValid: function() { return !!this.built; },

    rebuild: function() {
      this.dispose();
      if (!this.draw_mode)
        this.draw_mode = GL_TRIANGLES;

      var vertices = [], colors = [], textureCoords = [], normals = [], indices = [];
      if (this.init)
        this.init(vertices, colors, textureCoords, normals, indices);
      if (this.color)
        setColorCoords(this, vertices.length / 3, this.color, colors);

      if (colors.length == 0) // still no colors?? default to white
        setColorCoords(this, vertices.length / 3, [1,1,1,1], colors);

      if (vertices.length > 0)
      {
        this.buffers.vertex_buffer = new Jax.VertexBuffer(vertices);
        calculateBounds(this, vertices);
      }

      if (colors.length > 0) this.buffers.color_buffer = new Jax.ColorBuffer(colors);
      if (indices.length> 0) this.buffers.index_buffer = new Jax.ElementArrayBuffer(indices);
      if (normals.length> 0) this.buffers.normal_buffer= new Jax.NormalBuffer(normals);

      this.built = true;

      if (this.after_initialize) this.after_initialize();
    }
  });
})();
Jax.Events = (function() {
  return {
    Methods: {
      getEventListeners: function(name) {
        this.event_listeners = this.event_listeners || {};
        return this.event_listeners[name] = this.event_listeners[name] || [];
      },

      addEventListener: function(name, callback) {
        this.getEventListeners(name).push(callback);
      },

      fireEvent: function(name, event_object) {
        var listeners = this.getEventListeners(name);
        for (var i = 0; i < listeners.length; i++)
          listeners[i].call(this, event_object);
      }
    }
  };
})();
Jax.Scene = {};

Jax.Geometry = {};

Jax.Geometry.Plane = (function() {
  function innerProduct(a, x, y, z) {
    return (a[0]*x + a[1]*y + a[2]*z);
  }

  return Jax.Class.create({
    initialize: function(points) {
      if (points) this.set.apply(this, arguments);
    },

    set: function(points) {
      if (arguments.length == 3) points = [arguments[0], arguments[1], arguments[2]];

      this.normal = vec3.create();
      var vec = vec3.create();
      vec3.subtract(points[1], points[0], this.normal);
      vec3.subtract(points[2], points[0], vec);
      vec3.cross(this.normal, vec, this.normal);
      vec3.normalize(this.normal);

      this.point = points[1];
      this.d = -innerProduct(this.normal, this.point[0], this.point[1], this.point[2]);
    },

    setCoefficients: function(a, b, c, d) {
      var len = Math.sqrt(a*a+b*b+c*c);
      this.normal[0] = a/len;
      this.normal[1] = b/len;
      this.normal[2] = c/len;
      this.d = d/len;
    },

    distance: function(point)
    {
      var x, y, z;
      if (arguments.length == 3) { x = arguments[0]; y = arguments[1]; z = arguments[2]; }
      else { x = point[0]; y = point[1]; z = point[2]; }
      return this.d + innerProduct(this.normal, x, y, z);
    },

    whereis: function(point)
    {
      if (arguments.length == 3) points = [arguments[0], arguments[1], arguments[2]];
      var d = this.distance(point);
      if (d > 0) return Jax.Geometry.Plane.FRONT;
      if (d < 0) return Jax.Geometry.Plane.BACK;
      return Jax.Geometry.Plane.INTERSECT;
    }
  });
})();

Jax.Geometry.Plane.FRONT     = 1;
Jax.Geometry.Plane.BACK      = 2;
Jax.Geometry.Plane.INTERSECT = 3;

Jax.Scene.Frustum = (function() {
  var RIGHT = 0, LEFT = 1, BOTTOM = 2, TOP = 3, FAR = 4, NEAR = 5;
  var OUTSIDE = Jax.Geometry.Plane.BACK, INTERSECT = Jax.Geometry.Plane.INTERSECT, INSIDE = Jax.Geometry.Plane.FRONT;

  function extents(self)
  {
    /* TODO see how this can be combined with Camera#unproject */
    function extent(x, y, z)
    {
      var inf = [];
      var mm = self.mv, pm = self.p;

      var m = mat4.set(mm, mat4.create());

      mat4.inverse(m, m); // WHY do I have to do this? --see Jax.Context#reloadMatrices
      mat4.multiply(pm, m, m);
      mat4.inverse(m, m);

      inf[0]=x;//*2.0-1.0;    /* x*2-1 translates x from 0..1 to -1..1 */
      inf[1]=y;//*2.0-1.0;
      inf[2]=z;//*2.0-1.0;
      inf[3]=1.0;

      var out = mat4.multiplyVec4(m, inf);
      if(out[3]==0.0)
         return [0,0,0];//null;

      out[3]=1.0/out[3];
      return [out[0]*out[3], out[1]*out[3], out[2]*out[3]];
    }

    var ntl = extent(-1,1,-1), ntr = extent(1,1,-1), nbl = extent(-1,-1,-1), nbr = extent(1,-1,-1),
        ftl = extent(-1,1,1), ftr = extent(1,1,1), fbl = extent(-1,-1,1), fbr = extent(1,-1,1);

    return {ntl:ntl, ntr:ntr, nbl:nbl, nbr:nbr, ftl:ftl, ftr:ftr, fbl:fbl, fbr:fbr};
  }

  function varcube(self, position, w, h, d)
  {
    if (!self.mv || !self.p) return INSIDE;
    var p, c, c2 = 0, plane;

    w = w / 2.0;
    h = h / 2.0;
    d = d / 2.0;

    var xp = position[0]+w, xm=position[0]-w, yp=position[1]+h, ym=position[1]-h, zp=position[2]+d, zm=position[2]-d;

    for (p in self.planes)
    {
      plane = self.planes[p];
      c = 0;
      if (plane.distance(xp, yp, zp) > 0) c++;
      if (plane.distance(xm, yp, zp) > 0) c++;
      if (plane.distance(xp, ym, zp) > 0) c++;
      if (plane.distance(xm, ym, zp) > 0) c++;
      if (plane.distance(xp, yp, zm) > 0) c++;
      if (plane.distance(xm, yp, zm) > 0) c++;
      if (plane.distance(xp, ym, zm) > 0) c++;
      if (plane.distance(xm, ym, zm) > 0) c++;
      if (c == 0) return OUTSIDE;
      if (c == 8) c2++;
    }

    return (c2 == 6) ? INSIDE : INTERSECT;
  }

  function extractFrustum(self)
  {
    var frustum = self.planes;
    var e = extents(self);

    frustum[TOP].set(e.ntr, e.ntl, e.ftl);
    frustum[BOTTOM].set(e.nbl,e.nbr,e.fbr);
    frustum[LEFT].set(e.ntl,e.nbl,e.fbl);
    frustum[RIGHT].set(e.nbr,e.ntr,e.fbr);
    frustum[NEAR].set(e.ntl,e.ntr,e.nbr);
    frustum[FAR].set(e.ftr,e.ftl,e.fbl);
  }

  var klass = Jax.Class.create({
    initialize: function(modelview, projection) {
      this.listeners = {update:[]};
      this.callbacks = this.listeners;
      this.planes = {};
      for (var i = 0; i < 6; i++) this.planes[i] = new Jax.Geometry.Plane();
      this.setMatrices(modelview, projection);
    },

    update: function() { if (this.mv && this.p) { extractFrustum(this); this.fireListeners('update'); } },
    setModelviewMatrix: function(mv) { this.setMatrices(mv, this.p); },
    setProjectionMatrix: function(p) { this.setMatrices(this.mv, p); },

    setMatrices: function(mv, p) {
      this.mv = mv;
      this.p  = p;
      this.update();
    },

    point: function(point) {
      if (!this.mv || !this.p) return INSIDE;
      if (arguments.length == 3) point = [arguments[0], arguments[1], arguments[2]];

      for(var i=0; i < 6; i++)
      {
        if (this.planes[i].distance(point) < 0)
          return OUTSIDE;
      }
      return INSIDE;
    },

    sphere: function(center, radius)
    {
      if (!this.mv || !this.p) return INSIDE;
      if (arguments.length == 4) { center = [arguments[0], arguments[1], arguments[2]]; radius = arguments[3]; }

      var result = INSIDE, distance;
      for (var i = 0; i < 6; i++)
      {
        distance = this.planes[i].distance(center);
        if (distance < -radius) return OUTSIDE;
        else if (distance < radius) result = INTERSECT;
      }
      return result;
    },

    /* Arguments can either be an array of indices, or a position array [x,y,z] followed by width, height and depth.
        Examples:
          var cube = new Cube(...);
          frustum.cube(cube.getCorners());
          frustub.cube(cube.orientation.getPosition(), 1);
          frustub.cube(cube.orientation.getPosition(), 1, 2, 3);
     */
    cube: function(corners)
    {
      if (arguments.length == 2) { return varcube(this, arguments[0], arguments[1], arguments[1], arguments[1]); }
      if (arguments.length == 4) { return varcube(this, arguments[0], arguments[1], arguments[2], arguments[3]); }

      if (!this.mv || !this.p) return INSIDE;
      if (arguments.length > 1) { corners = arguments; }
      var p, c, c2 = 0, i, num_corners = corners.length, plane;
      for (p in this.planes)
      {
        plane = this.planes[p];
        c = 0;
        for (i = 0; i < num_corners; i++)
          if (plane.distance(corners[i]) > 0)
            c++;
        if (c == 0) return OUTSIDE;
        if (c == num_corners) c2++;
      }

      return (c2 == 6) ? INSIDE : INTERSECT;
    },

    addUpdateListener: function(callback) { this.listeners.update.push(callback); },
    sphereVisible: function(center, radius) { return this.sphere.apply(this, arguments) != OUTSIDE; },
    pointVisible:  function(center)         { return this.point.apply(this, arguments)  != OUTSIDE; },
    cubeVisible:   function(corners)        { return this.cube.apply(this, arguments)   != OUTSIDE; },

    fireListeners: function(name) {
      for (var i = 0; i < this.listeners[name].length; i++)
        this.listeners[name][i]();
    },

    isValid: function() { return this.p && this.mv; },

    getRenderable: function()
    {
      if (this.renderable) return this.renderable;

      var renderable = this.renderable = new Jax.Model({mesh: new Jax.Mesh()});
      renderable.upToDate = false;
      var frustum = this;

      function addVertices(e, vertices)
      {
        vertices.push(e.ntl[0], e.ntl[1], e.ntl[2]);
        vertices.push(e.ntr[0], e.ntr[1], e.ntr[2]);

        vertices.push(e.ntr[0], e.ntr[1], e.ntr[2]);
        vertices.push(e.nbr[0], e.nbr[1], e.nbr[2]);

        vertices.push(e.nbr[0], e.nbr[1], e.nbr[2]);
        vertices.push(e.nbl[0], e.nbl[1], e.nbl[2]);

        vertices.push(e.nbl[0], e.nbl[1], e.nbl[2]);
        vertices.push(e.ntl[0], e.ntl[1], e.ntl[2]);

        vertices.push(e.ftl[0], e.ftl[1], e.ftl[2]);
        vertices.push(e.ftr[0], e.ftr[1], e.ftr[2]);

        vertices.push(e.ftr[0], e.ftr[1], e.ftr[2]);
        vertices.push(e.fbr[0], e.fbr[1], e.fbr[2]);

        vertices.push(e.fbr[0], e.fbr[1], e.fbr[2]);
        vertices.push(e.fbl[0], e.fbl[1], e.fbl[2]);

        vertices.push(e.fbl[0], e.fbl[1], e.fbl[2]);
        vertices.push(e.ftl[0], e.ftl[1], e.ftl[2]);

        vertices.push(e.ntl[0], e.ntl[1], e.ntl[2]);
        vertices.push(e.ftl[0], e.ftl[1], e.ftl[2]);

        vertices.push(e.nbl[0], e.nbl[1], e.nbl[2]);
        vertices.push(e.fbl[0], e.fbl[1], e.fbl[2]);

        vertices.push(e.ntr[0], e.ntr[1], e.ntr[2]);
        vertices.push(e.ftr[0], e.ftr[1], e.ftr[2]);

        vertices.push(e.nbr[0], e.nbr[1], e.nbr[2]);
        vertices.push(e.fbr[0], e.fbr[1], e.fbr[2]);
      }

      renderable.mesh.init = function(vertices, colors) {
        this.draw_mode = GL_LINES;

        for (var i = 0; i < 24; i++)
        {
          vertices.push(0,0,0);
          colors.push(1,1,0,1);
        }
      };

      renderable.update = null;

      frustum.addUpdateListener(function() {
        if (!frustum.isValid()) { return; }

        renderable.upToDate = true;
        var buf = renderable.mesh.getVertexBuffer();
        if (!buf) return;
        var vertices = buf.js;
        vertices.clear();
        var e = extents(frustum);//{ntl:ntl, ntr:ntr, nbl:nbl, nbr:nbr, ftl:ftl, ftr:ftr, fbl:fbl, fbr:fbr};

        addVertices(e, vertices);

        buf.refresh();
      });

      return renderable;
    }
  });

  klass.INSIDE = INSIDE;
  klass.OUTSIDE = OUTSIDE;
  klass.INTERSECT = INTERSECT;

  return klass;
})();
Jax.Scene.LightSource = (function() {
  return Jax.Model.create({
    initialize: function($super, data) {
      data = data || {};
      data.enabled = typeof(data.enabled) == "undefined" ? true : data.enabled;
      data.attenuation           = data.attenuation           || {};
      data.attenuation.constant  = data.attenuation.constant  || 0;
      data.attenuation.linear    = data.attenuation.linear    || 0;
      data.attenuation.quadratic = data.attenuation.quadratic || 0.001;
      data.position = data.position || [0,0,0];
      data.ambient  = data.ambient  || [0,0,0,1];
      data.diffuse  = data.diffuse  || [1,1,1,1];
      data.specular = data.specular || [1,1,1,1];

      $super(data);
    },

    getDiffuseColor: function() { return this.diffuse; },
    getAmbientColor: function() { return this.ambient; },
    getSpecularColor: function() { return this.specular; },
    getPosition: function() { return this.camera.getPosition(); },
    getConstantAttenuation: function() { return this.attenuation.constant; },
    getQuadraticAttenuation: function() { return this.attenuation.quadratic; },
    getLinearAttenuation: function() { return this.attenuation.linear; },
    isEnabled: function() { return this.enabled; }
  });
})();

Jax.Scene.LightManager = (function() {
  return Jax.Class.create({
    initialize: function() {
      this._lights = [];
    },

    add: function(light) {
      if (this._lights.length == Jax.max_lights)
        throw new Error("Maximum number of light sources in a scene has been exceeded! Try removing some first.");
      this._lights.push(light);
    },

    isEnabled: function() {
      if (typeof(this.enabled) != "undefined") return this.enabled;
      if (arguments.length == 1) {
        if (this._lights.length > arguments[0]) return this._lights[arguments[0]].isEnabled();
        return false;
      }
      return this._lights.length > 0;
    },

    getLight: function(index) { return this._lights[index]; },

    getDiffuseColor: function(lightIndex) { return this._lights[lightIndex] ? this._lights[lightIndex].getDiffuseColor() : [1,1,1,1]; },

    getSpecularColor: function(lightIndex) { return this._lights[lightIndex] ? this._lights[lightIndex].getSpecularColor() : [1,1,1,1]; },

    getAmbientColor: function(lightIndex) { return this._lights[lightIndex] ? this._lights[lightIndex].getAmbientColor() : [1,1,1,1]; },

    getPosition: function(lightIndex) { return this._lights[lightIndex] ? this._lights[lightIndex].getPosition() : [0,0,0]; },

    getConstantAttenuation: function(lightIndex) { return this._lights[lightIndex] ? this._lights[lightIndex].getConstantAttenuation() : 0; },

    getLinearAttenuation: function(lightIndex) { return this._lights[lightIndex] ? this._lights[lightIndex].getLinearAttenuation() : 0; },

    getQuadraticAttenuation: function(lightIndex) { return this._lights[lightIndex] ? this._lights[lightIndex].getQuadraticAttenuation() : 0; }
  });
})();

Jax.Camera = (function() {
  var POSITION = 0, VIEW = 1, RIGHT = 2, UP = 3;

  /*
    handles storing data in the private _vecbuf, which is used solely to prevent
    unnecessary allocation of temporary vectors. Note that _vecbuf is used for many
    operations and data persistence not guaranteed (read: improbable).
   */
  function storeVecBuf(self, buftype) {
    switch(buftype) {
      case POSITION:
        self._vecbuf[0] = self.matrices.mv[12];
        self._vecbuf[1] = self.matrices.mv[13];
        self._vecbuf[2] = self.matrices.mv[14];
        break;
      case VIEW:
        self._vecbuf[0] = self.matrices.mv[2];
        self._vecbuf[1] = self.matrices.mv[6];
        self._vecbuf[2] = self.matrices.mv[10];
        vec3.negate(self._vecbuf);
        break;
      case RIGHT:
        self._vecbuf[0] = self.matrices.mv[0];
        self._vecbuf[1] = self.matrices.mv[4];
        self._vecbuf[2] = self.matrices.mv[8];
        break;
      case UP:
        self._vecbuf[0] = self.matrices.mv[1];
        self._vecbuf[1] = self.matrices.mv[5];
        self._vecbuf[2] = self.matrices.mv[9];
        break;
      default:
        throw new Error("Unexpected buftype: "+buftype);
    }
    return self._vecbuf;
  }

  function matrixUpdated(self) {

    self.normal_matrix_up_to_date = false;
    self.frustum_up_to_date       = false;

  }

  /*
    m[0]  m[4]  m[ 8]  m[12]
    m[1]  m[5]  m[ 9]  m[13]
    m[2]  m[6]  m[10]  m[14]
    m[3]  m[7]  m[11]  m[15]
   */
  return Jax.Class.create({
    initialize: function() {
      /* used for temporary storage, just to avoid repeatedly allocating temporary vectors */
      this._vecbuf = vec3.create();
      this.matrices = { mv: mat4.create(), p : mat4.identity(mat4.create()), n : mat4.create() };
      this.frustum = new Jax.Scene.Frustum(this.matrices.mv, this.matrices.p);

      this.addEventListener('matrixUpdated', function() { matrixUpdated(this); });
      this.reset();
    },

    getFrustum: function() {
      if (!this.frustum_up_to_date) this.frustum.update();
      this.frustum_up_to_date = true;
      return this.frustum;
    },

    getPosition:   function() { return vec3.create(storeVecBuf(this, POSITION)); },

    getViewVector: function() { return vec3.create(storeVecBuf(this, VIEW)); },

    getUpVector:   function() { return vec3.create(storeVecBuf(this, UP)); },

    getRightVector:function() { return vec3.create(storeVecBuf(this, RIGHT)); },

    ortho: function(options) {
      if (typeof(options.left)   == "undefined") options.left   = -1;
      if (typeof(options.right)  == "undefined") options.right  =  1;
      if (typeof(options.top)    == "undefined") options.top    =  1;
      if (typeof(options.bottom) == "undefined") options.bottom = -1;
      if (typeof(options.far)    == "undefined") options.far    = 200;
      options.near = options.near || 0.01;

      mat4.ortho(options.left, options.right, options.bottom, options.top, options.near, options.far, this.matrices.p);
      this.matrices.p.width = options.right - options.left;
      this.matrices.p.height= options.top - options.bottom;
      this.fireEvent('matrixUpdated');
    },

    setPosition: function() {
      var vec = vec3.create();
      switch(arguments.length) {
        case 1: vec3.set(arguments[0], vec); break;
        case 3: vec3.set(arguments,    vec); break;
        default: throw new Error("Invalid arguments for Camera#setPosition");
      }
      this.matrices.mv[12] = vec[0];
      this.matrices.mv[13] = vec[1];
      this.matrices.mv[14] = vec[2];
      this.fireEvent('matrixUpdated');
    },

    orient: function() {
      this._vecbuf2 = this._vecbuf2 || vec3.create();
      switch(arguments.length) {
        case 2: mat4.lookAt(storeVecBuf(this, POSITION), vec3.add(this._vecbuf, arguments[0], this._vecbuf2), arguments[1], this.matrices.mv); break;
        case 3: mat4.lookAt(arguments[2], vec3.add(arguments[0], arguments[2], this._vecbuf), arguments[1], this.matrices.mv); break;
        case 6: mat4.lookAt(storeVecBuf(this, POSITION),
                            [arguments[0]+this._vecbuf[0], arguments[1]+this._vecbuf[1], arguments[2]+this._vecbuf[2]],
                            [arguments[3], arguments[4], arguments[5]],
                            this.matrices.mv); break;
        case 9:
          vec3.set([arguments[6], arguments[7], arguments[8]], this._vecbuf);
          mat4.lookAt(this._vecbuf,
                      vec3.add(this._vecbuf, [arguments[0], arguments[1], arguments[2]], this._vecbuf2),
                      [arguments[3], arguments[4], arguments[5]],
                      this.matrices.mv); break;
        default: throw new Error("Invalid arguments for Camera#orient");
      }
      this.fireEvent('matrixUpdated');
    },

    perspective: function(options) {
      options = options || {};
      if (!options.width) throw new Error("Expected a screen width in Jax.Camera#perspective");
      if (!options.height)throw new Error("Expected a screen height in Jax.Camera#perspective");
      options.fov  = options.fov  || 45;
      options.near = options.near || 0.01;
      options.far  = options.far  || 200;

      var aspect_ratio = options.width / options.height;
      mat4.perspective(options.fov, aspect_ratio, options.near, options.far, this.matrices.p);
      this.matrices.p.width = options.width;
      this.matrices.p.height = options.height;
      this.fireEvent('matrixUpdated');
    },

    getModelViewMatrix: function() { return this.matrices.mv; },

    getProjectionMatrix: function() { return this.matrices.p; },

    getNormalMatrix: function() {
      if (!this.normal_matrix_up_to_date)
        mat4.transpose(mat4.inverse(this.matrices.mv, this.matrices.n), this.matrices.n);
      this.normal_matrix_up_to_date = true;
      return this.matrices.n;
    },

    unproject: function(winx, winy, winz) {
      if (typeof(winz) == "number") {
        winx = parseFloat(winx);
        winy = parseFloat(winy);
        winz = parseFloat(winz);

        var inf = [];
        var mm = this.matrices.mv, pm = this.matrices.p;
        var viewport = [0, 0, pm.width, pm.height];

        var m = mat4.set(mm, mat4.create());

        mat4.inverse(m, m); // WHY do I have to do this? --see Jax.Context#reloadMatrices
        mat4.multiply(pm, m, m);
        mat4.inverse(m, m);

        inf[0]=(winx-viewport[0])/viewport[2]*2.0-1.0;
        inf[1]=(winy-viewport[1])/viewport[3]*2.0-1.0;
        inf[2]=2.0*winz-1.0;
        inf[3]=1.0;

        var out = vec3.create();
        mat4.multiplyVec4(m, inf, out);
        if(out[3]==0.0)
           return null;

        out[3]=1.0/out[3];
        return [out[0]*out[3], out[1]*out[3], out[2]*out[3]];
      }
      else
        return [this.unproject(winx, winy, 0), this.unproject(winx, winy, 1)];
    },

    rotate: function() {
      var amount = arguments[0];
      var vec;
      switch(arguments.length) {
        case 2: vec = arguments[1]; break;
        case 4: vec = this._vecbuf; vec[0] = arguments[1]; vec[1] = arguments[2]; vec[2] = arguments[3];  break;
        default: throw new Error("Invalid arguments");
      }

      if      (vec[1] == 0 && vec[2] == 0) mat4.rotateX(this.matrices.mv, amount*vec[0], this.matrices.mv);
      else if (vec[0] == 0 && vec[2] == 0) mat4.rotateY(this.matrices.mv, amount*vec[1], this.matrices.mv);
      else if (vec[0] == 0 && vec[1] == 0) mat4.rotateZ(this.matrices.mv, amount*vec[2], this.matrices.mv);
      else                                 mat4.rotate (this.matrices.mv, amount,   vec, this.matrices.mv);

      this.fireEvent('matrixUpdated');
      return this;
    },

    strafe: function(distance) {
      mat4.translate(this.matrices.mv, vec3.scale(storeVecBuf(this, RIGHT), distance), this.matrices.mv);
      this.fireEvent('matrixUpdated');
      return this;
    },

    move: function(distance, direction) {
      direction = direction || storeVecBuf(this, VIEW);
      mat4.translate(this.matrices.mv, vec3.scale(direction, distance), this.matrices.mv);
      this.fireEvent('matrixUpdated');
      return this;
    },

    reset: function() { this.orient([0,0,-1],[0,1,0],[0,0,0]); }
  });
})();

Jax.Camera.addMethods(Jax.Events.Methods);

Jax.World = (function() {
  return Jax.Class.create({
    initialize: function(context) {
      this.context  = context;
      this.lighting = new Jax.Scene.LightManager();
      this.objects  = [];
    },

    addLightSource: function(light)   { this.lighting.add(light); },

    addObject: function(object) { this.objects.push(object); },

    render: function() {
      for (var i = 0; i < this.objects.length; i++)
        this.objects[i].render(this.context);
    }
  });
})();
Jax.EVENT_METHODS = (function() {
  function getCumulativeOffset(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);

    var result = [valueL, valueT];
    result.left = valueL;
    result.top = valueT;
    return result;
  }

  function buildKeyEvent(self, evt) {
    var keyboard = self.keyboard;

    evt = evt || window.event || {};
    evt.context = self;
    evt.canvas = self.canvas;
    keyboard.last = evt;

    /*
    TODO track all keypresses and whatnot via @keyboard, so all keys can be queried at any given time
     */

    return evt;
  }

  function buildMouseEvent(self, evt) {
    var mouse = self.mouse;

    evt = evt || window.event || {};
    evt.context = self;
    evt.canvas = self.canvas;
    evt.offsetx = mouse.x;
    evt.offsety = mouse.y;
    evt.mouse = mouse;

    mouse.offsetx = evt.offsetx || 0;
    mouse.offsety = evt.offsety || 0;

    var cumulativeOffset = getCumulativeOffset(self.canvas);
    mouse.x = evt.clientX - cumulativeOffset[0];
    mouse.y = evt.clientY - cumulativeOffset[1];
    mouse.y = self.canvas.height - mouse.y; // invert y

    if (window.pageXOffset) {
      mouse.x += window.pageXOffset;
      mouse.y += window.pageYOffset;
    } else {
      mouse.x += document.body.scrollLeft;
      mouse.y += document.body.scrollTop;
    }

    mouse.diffx = mouse.x - mouse.offsetx;
    mouse.diffy = mouse.y - mouse.offsety;

    if (evt.type == "mousedown" || evt.type == "onmousedown") {
      mouse.down = mouse.down || {count:0};
      mouse.down["button"+evt.which] = {at:[mouse.x,mouse.y]};
    } else if (evt.type == "mouseup" || evt.type == "onmouseup") {
      if (mouse.down)
      {
        mouse.down.count--;
        if (mouse.down.count <= 0) mouse.down = null;
      }
    }

    return evt;
  }

  function dispatchEvent(self, evt) {
    var type = evt.type.toString();
    if (type.indexOf("on") == 0) type = type.substring(2, type.length);
    type = type.toLowerCase();
    var target;
    switch(type) {
      case "click":     target = "mouse_clicked"; break;
      case "mousemove":
        if (evt.move_type == 'mousemove') target = "mouse_moved";
        else                              target = "mouse_dragged";
        break;
      case "mousedown": target = "mouse_pressed"; break;
      case "mouseout":  target = "mouse_exited";  break;
      case "mouseover": target = "mouse_entered"; break;
      case "mouseup":   target = "mouse_released";break;
      case "keydown":   target = "key_down";      break;
      case "keypress":  target = "key_pressed";   break;
      case "keyup":     target = "key_released";  break;
      default: return true; // don't dispatch this event to the controller
    }
    if (self.current_controller[target])
    {
      var result = self.current_controller[target](evt);
      if (typeof(result) != "undefined") return result;
    }
    return true;
  }

  return {
    setupEventListeners: function() {
      this.keyboard = {};
      this.mouse = {};

      var canvas = this.canvas;
      var self = this;

      var mousefunc     = function(evt) {
        if (!self.current_controller) return;
        evt = buildMouseEvent(self, evt);
        return dispatchEvent(self, evt);
      };
      var mousemovefunc = function(evt) {
        if (!self.current_controller) return;
        evt = buildMouseEvent(self, evt);
        if (self.mouse && self.mouse.down == null) // mouse is not being dragged
          evt.move_type = "mousemove";
        else
          evt.move_type = "mousedrag";
        return dispatchEvent(self, evt);
      };
      var keyfunc       = function(evt) {
        if (!self.current_controller) return;
        evt = buildKeyEvent(self, evt);
        return dispatchEvent(self, evt);
      };

      if (canvas.addEventListener) {
        /* W3 */
        canvas.addEventListener('click',     mousefunc,     false);
        canvas.addEventListener('mousedown', mousefunc,     false);
        canvas.addEventListener('mousemove', mousemovefunc, false);
        canvas.addEventListener('mouseout',  mousefunc,     false);
        canvas.addEventListener('mouseover', mousefunc,     false);
        canvas.addEventListener('mouseup',   mousefunc,     false);
        canvas.addEventListener('keydown',   keyfunc,       false);
        canvas.addEventListener('keypress',  keyfunc,       false);
        canvas.addEventListener('keyup',     keyfunc,       false);
      } else {
        /* IE */
        canvas.attachEvent('onclick',     mousefunc    );
        canvas.attachEvent('onmousedown', mousefunc    );
        canvas.attachEvent('onmousemove', mousemovefunc);
        canvas.attachEvent('onmouseout',  mousefunc    );
        canvas.attachEvent('onmouseover', mousefunc    );
        canvas.attachEvent('onmouseup',   mousefunc    );
        canvas.attachEvent('onkeydown',   keyfunc      );
        canvas.attachEvent('onkeypress',  keyfunc      );
        canvas.attachEvent('onkeyup',     keyfunc      );
      }
    }
  };
})();

Jax.Context = (function() {
  function setupContext(self) {
    try { self.gl = self.canvas.getContext(WEBGL_CONTEXT_NAME); } catch(e) { }
    if (!self.gl) throw new Error("WebGL could not be initialized!");
  }

  function startRendering(self) {
    function render() {
      if (self.current_view) {
        reloadMatrices(self);
        self.glViewport(0, 0, self.canvas.width, self.canvas.height);
        self.current_view.render();
        self.render_interval = requestAnimFrame(render, self.canvas);
      }
      else {
        clearTimeout(self.render_interval);
        self.render_interval = null;
      }
    }

    self.render_interval = setTimeout(render, Jax.render_speed);
  }

  function setupView(self, view) {
    view.context = self;
    view.world = self.world;
    view.player = self.player;
    for (var i in self) {
      if (i.indexOf("gl") == 0) {
        /* it's a WebGL method */
        view[i] = eval("(function() { return this.context."+i+".apply(this.context, arguments); })");
      }
    }
    /* TODO we should set up helpers, etc. here too */
  }

  function reloadMatrices(self) {
    mat4.set(self.player.camera.getModelViewMatrix(), self.getModelViewMatrix());

    mat4.inverse(self.matrices[self.matrix_depth]);
  }

  return Jax.Class.create({
    initialize: function(canvas) {
      this.id = ++Jax.Context.identifier;
      this.canvas = canvas;
      setupContext(this);
      this.setupEventListeners();
      this.render_interval = null;
      this.glClearColor(0.0, 0.0, 0.0, 1.0);
      this.glClearDepth(1.0);
      this.glEnable(GL_DEPTH_TEST);
      this.glDepthFunc(GL_LEQUAL);
      this.glEnable(GL_BLEND);
      this.glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
      this.checkForRenderErrors();
      this.world = new Jax.World(this);
      this.player = {camera: new Jax.Camera()};
      this.player.camera.perspective({width:canvas.width, height:canvas.height});

      this.matrices = [mat4.create()];
      mat4.set(this.player.camera.getModelViewMatrix(), this.matrices[0]);
      this.matrix_depth = 0;

      if (Jax.routes.isRouted("/"))
        this.redirectTo("/");
    },

    redirectTo: function(path) {
      this.current_controller = Jax.routes.dispatch(path, this);
      if (!this.current_controller.view_key)
        throw new Error("Controller '"+this.current_controller.getControllerName()+"' did not produce a renderable result");
      this.current_view = Jax.views.find(this.current_controller.view_key);
      setupView(this, this.current_view);
      if (!this.isRendering()) startRendering(this);
    },

    isRendering: function() {
      return this.render_interval != null;
    },

    dispose: function() {
      this.disposed = true;
    },

    isDisposed: function() {
      return !!this.disposed;
    },

    pushMatrix: function(yield_to) {
      var current = this.getModelViewMatrix();
      this.matrix_depth++;
      if (!this.matrices[this.matrix_depth]) this.matrices[this.matrix_depth] = mat4.create();
      mat4.set(current, this.matrices[this.matrix_depth]);
      yield_to();
      this.matrix_depth--;
    },

    multMatrix: function(matr) {
      mat4.multiply(this.getModelViewMatrix(), matr);
    },

    getFrustum: function() {
      return this.player.camera.frustum;
    },

    getModelViewMatrix: function() { return this.matrices[this.matrix_depth]; },

    getProjectionMatrix: function() { return this.player.camera.getProjectionMatrix(); },

    getNormalMatrix: function() {
      var mat = mat4.create();
      mat4.inverse(this.getModelViewMatrix(), mat);
      mat4.transpose(mat);
      return mat;
    },

    checkForRenderErrors: function() {
      /* Error checking is slow, so don't do it in production mode */
      if (Jax.environment == "production") return; /* TODO expose Jax.environment to application */

      var error = this.glGetError();
      if (error != GL_NO_ERROR)
      {
        var str = "GL error in "+this.canvas.id+": "+error;
        error = new Error(str);
        var message = error;
        if (error.stack)
        {
          var stack = error.stack.split("\n");
          stack.shift();
          message += "\n\n"+stack.join("\n");
        }

        throw error;
      }
    },

    handleRenderError: function(method_name, args, err) {
      throw err;
    }
  });
})();

Jax.Context.identifier = 0;
Jax.Context.addMethods(GL_METHODS);
Jax.Context.addMethods(Jax.EVENT_METHODS);

Jax.shader_program_builders = {};

Jax.views = new Jax.ViewManager();

Jax.routes = new Jax.RouteSet();

Jax.loaded = true;

Jax.render_speed = 15;

Jax.max_lights = 32;

/* shader builders */
/*
  Failsafe shader - useful for debugging. Renders an object using vertex data only. The object's
  color is hard-coded to pure red.
 */
Jax.shader_program_builders['failsafe'] = (function() {
  function buildVertexSource(options) {
    return ["attribute vec3 vertexPosition;",

            "uniform mat4 mvMatrix;",
            "uniform mat4 pMatrix;",

            "void main(void) {",
            "  gl_Position = pMatrix * mvMatrix * vec4(vertexPosition, 1.0);",
            "}"]
  }

  function buildFragmentSource(options) {
    return ["void main(void) {",
            "  gl_FragColor = vec4(1,0,0,1);",
            "}"]
  }

  return function(options) {
    return {
      vertex_source: buildVertexSource(options),
      fragment_source: buildFragmentSource(options),
      uniforms: {
        mvMatrix: {
          type: "glUniformMatrix4fv",
          value: function(context, mesh) { return context.getModelViewMatrix(); }
        },
        pMatrix: {
          type: "glUniformMatrix4fv",
          value: function(context, mesh) { return context.getProjectionMatrix(); }
        }
      },
      attributes: {
        vertexPosition: function(context, mesh) { return mesh.getVertexBuffer(); }
      }
    };
  }
})();
Jax.shader_program_builders['color_without_texture'] = (function() {
  function buildVertexSource(options) {
    return ["attribute vec3 vertexPosition;",
            "attribute vec4 vertexColor;",

            "uniform mat4 mvMatrix;",
            "uniform mat4 pMatrix;",

            "varying vec4 vColor;",

            "void main(void) {",
            "  gl_Position = pMatrix * mvMatrix * vec4(vertexPosition, 1.0);",
            "  vColor = vertexColor;",
            "}"]
  }

  function buildFragmentSource(options) {
    return ["varying vec4 vColor;",

            "void main(void) {",
            "  gl_FragColor = vColor;",
            "}"]
  }

  return function(options) {
    return {
      vertex_source: buildVertexSource(options),
      fragment_source: buildFragmentSource(options),
      uniforms: {
        mvMatrix: {
          type: "glUniformMatrix4fv",
          value: function(context, mesh) { return context.getModelViewMatrix(); }
        },
        pMatrix: {
          type: "glUniformMatrix4fv",
          value: function(context, mesh) { return context.getProjectionMatrix(); }
        }
      },
      attributes: {
        vertexPosition: function(context, mesh) { return mesh.getVertexBuffer(); },
        vertexColor   : function(context, mesh) { return mesh.getColorBuffer();  }
      }
    };
  }
})();
Jax.shader_program_builders['phong'] = (function() {
  function defLights(options) {
    var result = ["uniform bool lightingEnabled;"];

    for (var i = 0; i < options.light_count; i++) {
      result.push(
              'uniform float lightConstantAttenuation'+i+',                    ',
              '              lightLinearAttenuation'+i+',                      ',
              '              lightQuadraticAttenuation'+i+';                   ',
              'uniform vec3 lightPosition'+i+';                                ',
              'varying vec3 lightDirection'+i+';                               ',
              'varying float lightAtt'+i+';                                    ',
              'uniform bool lightEnabled'+i+';                                 ',
              'uniform vec4 lightAmbient'+i+',                                 ',
              '             lightDiffuse'+i+',                                 ',
              '             lightSpecular'+i+';                                ',
              ''
      )
    }

    return result.join("\n");
  }

  function buildVertexSource(options) {
    function calculateLights(options) {
      if (!options.light_count) return [];

      var result = [ '',
        'if (lightingEnabled) {'];
      for (var i = 0; i < options.light_count; i++) result.push(
        '  if (lightEnabled'+i+' == true) {',
        '    lightDirection'+i+' = vec3(lightPosition'+i+' - vVertex);       ',
        '    d = length(lightDirection'+i+');                            ',
        '    lightAtt'+i+' = 1.0 / ( lightConstantAttenuation'+i+' +         ',
        '    (lightLinearAttenuation'+i+'*d) +                           ',
        '    (lightQuadraticAttenuation'+i+'*d*d) );                     ',
        '  }',
        ''
      )
      result.push('}', '');
      return result.join("\n");
    }

    var s = [
      defLights(options),
      'varying vec3 normal, eyeVec;                                ',
      'varying vec4 color;                                         ',
      'attribute vec3 vertexPosition, vertexNormal;                ',
      'attribute vec4 vertexColor;                                 ',
      'uniform mat4 mvMatrix, pMatrix, nMatrix;                    ',

      'void main()                                                 ',
      '{	                                                       ',
      '    float d;                                                ',
      '    normal = vec3(nMatrix * vec4(vertexNormal, 1));         ',
      '    vec3 vVertex = vec3(mvMatrix * vec4(vertexPosition, 1));',
      '    eyeVec = -vVertex;                                      ',
      '    color = vertexColor;                                    ',

      calculateLights(options),

      '    gl_Position = pMatrix * mvMatrix * vec4(vertexPosition,1);         ',
      '}'
    ];

    return s;
  }

  function buildFragmentSource(options) {
    function calculateLights() {
      if (!options.light_count) return [];

      var result = [ '',
        '  if (lightingEnabled) {                                                 ',
        '    final_color = final_color * matr_ambient;                            '
      ];

      for (var i = 0; i < options.light_count; i++) result.push(
        '    if (lightEnabled'+i+') {                                         ',
        '      final_color = final_color + (lightAmbient'+i+'*matr_ambient)*lightAtt'+i+';',
        '      L = normalize(lightDirection'+i+');                                    ',
        '      lambertTerm = dot(N,L);                                            ',
        '      if(lambertTerm > 0.0)                                              ',
        '      {                                                                  ',
        '        final_color += lightDiffuse'+i+'*matr_diffuse*lambertTerm*lightAtt'+i+'; ',
        '        R = reflect(-L, N);                                              ',
        '        specular = pow( max(dot(R, E), 0.0), matr_shininess);            ',
        '        final_color += lightSpecular'+i+'*matr_specular*specular*lightAtt'+i+';  ',
        '      }                                                                  ',
        '    }                                                                    ',
        ''
      );

      result.push('}', '');
      return result.join("\n");
    }

    var s = [
      defLights(options),
      'uniform vec4 matr_ambient,                                               ',
      '             matr_diffuse,                                               ',
      '             matr_specular;                                              ',
      'uniform float matr_shininess;                                            ',
      'varying vec3 normal, eyeVec;                                             ',
      'varying vec4 color;                                                      ',

      'void main (void)                                                         ',
      '{                                                                        ',
      '  vec3 N = normalize(normal), L, E = normalize(eyeVec), R;               ',
      '  float lambertTerm, specular;                                           ',

      '  vec4 final_color = color;                                              ',

      calculateLights(options),

      '  gl_FragColor = final_color;			                                ',
      '}                                                                        '

    ];
    return s;
  }

  return function(options) {
    var result = {
      vertex_source: buildVertexSource(options),
      fragment_source: buildFragmentSource(options),
      attributes: {
        vertexPosition: function(context, mesh) { return mesh.getVertexBuffer(); },
        vertexColor   : function(context, mesh) { return mesh.getColorBuffer();  },
        vertexNormal  : function(context, mesh) { return mesh.getNormalBuffer(); }
      },
      uniforms: {
        mvMatrix: { type: "glUniformMatrix4fv", value: function(context) { return context.getModelViewMatrix();  } },
        pMatrix:  { type: "glUniformMatrix4fv", value: function(context) { return context.getProjectionMatrix(); } },
        nMatrix:  { type: "glUniformMatrix4fv", value: function(context) { return context.getNormalMatrix();     } },
        lightingEnabled: { type: "glUniform1i", value: function(context) { return context.world.lighting.isEnabled(); } },
        matr_ambient: { type: "glUniform4fv", value: function(context) { return options.colors.ambient || [0.2,0.2,0.2,1]; } },
        matr_diffuse: { type: "glUniform4fv", value: function(context) { return options.colors.diffuse || [1,1,1,1]; } },
        matr_specular: { type: "glUniform4fv", value: function(context) { return options.colors.specular || [1,1,1,1]; } },
        matr_shininess: { type: "glUniform1f", value: function(context) { return options.glossiness; } }
      }
    };

    for (var i = 0; i < options.light_count; i++)
    {
      result.uniforms['lightDiffuse'+i] = { index: i, type: "glUniform4fv", value: function(ctx) {
        return ctx.world.lighting.getDiffuseColor(this.index);
      } };

      result.uniforms['lightSpecular'+i] = { index: i, type: "glUniform4fv", value: function(ctx) {
        return ctx.world.lighting.getSpecularColor(this.index);
      } };

      result.uniforms['lightAmbient'+i] = { index: i, type: "glUniform4fv", value: function(ctx) {
        return ctx.world.lighting.getAmbientColor(this.index);
      } };

      result.uniforms['lightEnabled'+i] = { index: i, type: "glUniform1i", value: function(ctx) {
        return ctx.world.lighting.isEnabled(this.index);
      } };

      result.uniforms['lightPosition'+i] = { index: i, type: "glUniform3fv", value: function(ctx) {
        return ctx.world.lighting.getPosition(this.index);
      } };

      result.uniforms['lightConstantAttenuation'+i] = { index: i, type: "glUniform1f", value: function(ctx) {
        return ctx.world.lighting.getConstantAttenuation(this.index);
      } };

      result.uniforms['lightLinearAttenuation'+i] = { index: i, type: "glUniform1f", value: function(ctx) {
        return ctx.world.lighting.getLinearAttenuation(this.index);
      } };

      result.uniforms['lightQuadraticAttenuation'+i] = { index: i, type: "glUniform1f", value: function(ctx) {
        return ctx.world.lighting.getQuadraticAttenuation(this.index);
      } };
    }

    return result;
  }
})();

/* meshes */
Jax.Mesh.Quad = (function() {
  return Jax.Class.create(Jax.Mesh, {
    initialize: function($super, options) {
      if (typeof(options) == "number") { options = {width:options, height:options}; }
      this.draw_mode = GL_TRIANGLE_STRIP;
      $super(options);

      this.setSize(options && options.width || 1, options && options.height || 1)
    },

    setWidth: function(width) { this.setSize(width, this.height); },

    setHeight:function(height){ this.setHeight(this.width, height); },

    setSize: function(width, height) {
      this.width = width;
      this.height = height;
      this.rebuild();
    },

    init: function(verts, colors, textureCoords, normals) {
      var width = this.width/2, height = this.height/2;

      verts.push(-width, -height, 0);
      verts.push(-width,  height, 0);
      verts.push( width, -height, 0);
      verts.push( width,  height, 0);

      colors.push(1,1,1,1);
      colors.push(1,1,1,1);
      colors.push(1,1,1,1);
      colors.push(1,1,1,1);

      textureCoords.push(0, 1);
      textureCoords.push(0, 0);
      textureCoords.push(1, 1);
      textureCoords.push(1, 0);

      normals.push(0,0,1);
      normals.push(0,0,1);
      normals.push(0,0,1);
      normals.push(0,0,1);
    }
  });
})();
Jax.Mesh.Torus = Jax.Class.create(Jax.Mesh, {
  initialize: function($super, options) {
    this.inner_radius = typeof(options.inner_radius) == "undefined" ? 0.6 : options.inner_radius;
    this.outer_radius = typeof(options.outer_radius) == "undefined" ? 1.8 : options.inner_radius;
    this.sides        = typeof(options.sides       ) == "undefined" ? 128 : options.inner_radius;
    this.rings        = typeof(options.rings       ) == "undefined" ? 256 : options.inner_radius;
    $super(options);
  },

  init: function(vertices, colors, texes, normals) {
    this.draw_mode = GL_TRIANGLE_STRIP;
    var tube_radius = this.inner_radius, radius = this.outer_radius, sides = this.sides, rings = this.rings;

    var i, j, theta, phi, theta1, costheta, sintheta, costheta1, sintheta1, ringdelta, sidedelta, cosphi, sinphi,
        dist;

    sidedelta = 2 * Math.PI / sides;
    ringdelta = 2 * Math.PI / rings;
    theta = 0;
    costheta = 1.0;
    sintheta = 0;

    for (i = rings - 1; i >= 0; i--) {
      theta1 = theta + ringdelta;
      costheta1 = Math.cos(theta1);
      sintheta1 = Math.sin(theta1);
      phi = 0;
      for (j = sides; j >= 0; j--) {
        phi = phi + sidedelta;
        cosphi = Math.cos(phi);
        sinphi = Math.sin(phi);
        dist = radius + (tube_radius * cosphi);

        normals.push(costheta1 * cosphi, -sintheta1 * cosphi, sinphi);
        vertices.push(costheta1 * dist, -sintheta1 * dist, tube_radius * sinphi);

        normals.push(costheta * cosphi, -sintheta * cosphi, sinphi);
        vertices.push(costheta * dist, -sintheta * dist, tube_radius * sinphi);
      }
      theta = theta1;
      costheta = costheta1;
      sintheta = sintheta1;
    }
  }
});
