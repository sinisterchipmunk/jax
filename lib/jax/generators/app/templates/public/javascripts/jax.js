var Jax = { };

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
  Jax.Model = (function() {
    return Jax.Class.create({
      initialize: function(data) {
        var attribute, defs;

        if (this._klass && this._klass.resources && (defs = this._klass.resources['default']))
          for (attribute in defs)
            this[attribute] = defs[attribute];

        if (data)
          for (attribute in data)
            this[attribute] = data[attribute];

        if (this.after_initialize) this.after_initialize();
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
    invoke: function(action_name) {
      var instance = new this();
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

    dispatch: function(path) {
      var route = this.recognize_route(path);

      return route.controller.invoke(route.action);
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

glMatrixArrayType=typeof Float32Array!="undefined"?Float32Array:typeof WebGLFloatArray!="undefined"?WebGLFloatArray:Array;var vec3={};vec3.create=function(a){var b=new glMatrixArrayType(3);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2]}return b};vec3.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];return b};vec3.add=function(a,b,c){if(!c||a==c){a[0]+=b[0];a[1]+=b[1];a[2]+=b[2];return a}c[0]=a[0]+b[0];c[1]=a[1]+b[1];c[2]=a[2]+b[2];return c};
vec3.subtract=function(a,b,c){if(!c||a==c){a[0]-=b[0];a[1]-=b[1];a[2]-=b[2];return a}c[0]=a[0]-b[0];c[1]=a[1]-b[1];c[2]=a[2]-b[2];return c};vec3.negate=function(a,b){b||(b=a);b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];return b};vec3.scale=function(a,b,c){if(!c||a==c){a[0]*=b;a[1]*=b;a[2]*=b;return a}c[0]=a[0]*b;c[1]=a[1]*b;c[2]=a[2]*b;return c};
vec3.normalize=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=Math.sqrt(c*c+d*d+e*e);if(g){if(g==1){b[0]=c;b[1]=d;b[2]=e;return b}}else{b[0]=0;b[1]=0;b[2]=0;return b}g=1/g;b[0]=c*g;b[1]=d*g;b[2]=e*g;return b};vec3.cross=function(a,b,c){c||(c=a);var d=a[0],e=a[1];a=a[2];var g=b[0],f=b[1];b=b[2];c[0]=e*b-a*f;c[1]=a*g-d*b;c[2]=d*f-e*g;return c};vec3.length=function(a){var b=a[0],c=a[1];a=a[2];return Math.sqrt(b*b+c*c+a*a)};vec3.dot=function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]};
vec3.direction=function(a,b,c){c||(c=a);var d=a[0]-b[0],e=a[1]-b[1];a=a[2]-b[2];b=Math.sqrt(d*d+e*e+a*a);if(!b){c[0]=0;c[1]=0;c[2]=0;return c}b=1/b;c[0]=d*b;c[1]=e*b;c[2]=a*b;return c};vec3.lerp=function(a,b,c,d){d||(d=a);d[0]=a[0]+c*(b[0]-a[0]);d[1]=a[1]+c*(b[1]-a[1]);d[2]=a[2]+c*(b[2]-a[2]);return d};vec3.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+"]"};var mat3={};
mat3.create=function(a){var b=new glMatrixArrayType(9);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9]}return b};mat3.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];return b};mat3.identity=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=1;a[5]=0;a[6]=0;a[7]=0;a[8]=1;return a};
mat3.transpose=function(a,b){if(!b||a==b){var c=a[1],d=a[2],e=a[5];a[1]=a[3];a[2]=a[6];a[3]=c;a[5]=a[7];a[6]=d;a[7]=e;return a}b[0]=a[0];b[1]=a[3];b[2]=a[6];b[3]=a[1];b[4]=a[4];b[5]=a[7];b[6]=a[2];b[7]=a[5];b[8]=a[8];return b};mat3.toMat4=function(a,b){b||(b=mat4.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=0;b[4]=a[3];b[5]=a[4];b[6]=a[5];b[7]=0;b[8]=a[6];b[9]=a[7];b[10]=a[8];b[11]=0;b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};
mat3.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+"]"};var mat4={};mat4.create=function(a){var b=new glMatrixArrayType(16);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=a[12];b[13]=a[13];b[14]=a[14];b[15]=a[15]}return b};
mat4.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=a[12];b[13]=a[13];b[14]=a[14];b[15]=a[15];return b};mat4.identity=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=0;a[5]=1;a[6]=0;a[7]=0;a[8]=0;a[9]=0;a[10]=1;a[11]=0;a[12]=0;a[13]=0;a[14]=0;a[15]=1;return a};
mat4.transpose=function(a,b){if(!b||a==b){var c=a[1],d=a[2],e=a[3],g=a[6],f=a[7],h=a[11];a[1]=a[4];a[2]=a[8];a[3]=a[12];a[4]=c;a[6]=a[9];a[7]=a[13];a[8]=d;a[9]=g;a[11]=a[14];a[12]=e;a[13]=f;a[14]=h;return a}b[0]=a[0];b[1]=a[4];b[2]=a[8];b[3]=a[12];b[4]=a[1];b[5]=a[5];b[6]=a[9];b[7]=a[13];b[8]=a[2];b[9]=a[6];b[10]=a[10];b[11]=a[14];b[12]=a[3];b[13]=a[7];b[14]=a[11];b[15]=a[15];return b};
mat4.determinant=function(a){var b=a[0],c=a[1],d=a[2],e=a[3],g=a[4],f=a[5],h=a[6],i=a[7],j=a[8],k=a[9],l=a[10],o=a[11],m=a[12],n=a[13],p=a[14];a=a[15];return m*k*h*e-j*n*h*e-m*f*l*e+g*n*l*e+j*f*p*e-g*k*p*e-m*k*d*i+j*n*d*i+m*c*l*i-b*n*l*i-j*c*p*i+b*k*p*i+m*f*d*o-g*n*d*o-m*c*h*o+b*n*h*o+g*c*p*o-b*f*p*o-j*f*d*a+g*k*d*a+j*c*h*a-b*k*h*a-g*c*l*a+b*f*l*a};
mat4.inverse=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=a[4],h=a[5],i=a[6],j=a[7],k=a[8],l=a[9],o=a[10],m=a[11],n=a[12],p=a[13],r=a[14],s=a[15],A=c*h-d*f,B=c*i-e*f,t=c*j-g*f,u=d*i-e*h,v=d*j-g*h,w=e*j-g*i,x=k*p-l*n,y=k*r-o*n,z=k*s-m*n,C=l*r-o*p,D=l*s-m*p,E=o*s-m*r,q=1/(A*E-B*D+t*C+u*z-v*y+w*x);b[0]=(h*E-i*D+j*C)*q;b[1]=(-d*E+e*D-g*C)*q;b[2]=(p*w-r*v+s*u)*q;b[3]=(-l*w+o*v-m*u)*q;b[4]=(-f*E+i*z-j*y)*q;b[5]=(c*E-e*z+g*y)*q;b[6]=(-n*w+r*t-s*B)*q;b[7]=(k*w-o*t+m*B)*q;b[8]=(f*D-h*z+j*x)*q;
b[9]=(-c*D+d*z-g*x)*q;b[10]=(n*v-p*t+s*A)*q;b[11]=(-k*v+l*t-m*A)*q;b[12]=(-f*C+h*y-i*x)*q;b[13]=(c*C-d*y+e*x)*q;b[14]=(-n*u+p*B-r*A)*q;b[15]=(k*u-l*B+o*A)*q;return b};mat4.toRotationMat=function(a,b){b||(b=mat4.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};
mat4.toMat3=function(a,b){b||(b=mat3.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[4];b[4]=a[5];b[5]=a[6];b[6]=a[8];b[7]=a[9];b[8]=a[10];return b};mat4.toInverseMat3=function(a,b){var c=a[0],d=a[1],e=a[2],g=a[4],f=a[5],h=a[6],i=a[8],j=a[9],k=a[10],l=k*f-h*j,o=-k*g+h*i,m=j*g-f*i,n=c*l+d*o+e*m;if(!n)return null;n=1/n;b||(b=mat3.create());b[0]=l*n;b[1]=(-k*d+e*j)*n;b[2]=(h*d-e*f)*n;b[3]=o*n;b[4]=(k*c-e*i)*n;b[5]=(-h*c+e*g)*n;b[6]=m*n;b[7]=(-j*c+d*i)*n;b[8]=(f*c-d*g)*n;return b};
mat4.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2],f=a[3],h=a[4],i=a[5],j=a[6],k=a[7],l=a[8],o=a[9],m=a[10],n=a[11],p=a[12],r=a[13],s=a[14];a=a[15];var A=b[0],B=b[1],t=b[2],u=b[3],v=b[4],w=b[5],x=b[6],y=b[7],z=b[8],C=b[9],D=b[10],E=b[11],q=b[12],F=b[13],G=b[14];b=b[15];c[0]=A*d+B*h+t*l+u*p;c[1]=A*e+B*i+t*o+u*r;c[2]=A*g+B*j+t*m+u*s;c[3]=A*f+B*k+t*n+u*a;c[4]=v*d+w*h+x*l+y*p;c[5]=v*e+w*i+x*o+y*r;c[6]=v*g+w*j+x*m+y*s;c[7]=v*f+w*k+x*n+y*a;c[8]=z*d+C*h+D*l+E*p;c[9]=z*e+C*i+D*o+E*r;c[10]=z*
g+C*j+D*m+E*s;c[11]=z*f+C*k+D*n+E*a;c[12]=q*d+F*h+G*l+b*p;c[13]=q*e+F*i+G*o+b*r;c[14]=q*g+F*j+G*m+b*s;c[15]=q*f+F*k+G*n+b*a;return c};mat4.multiplyVec3=function(a,b,c){c||(c=b);var d=b[0],e=b[1];b=b[2];c[0]=a[0]*d+a[4]*e+a[8]*b+a[12];c[1]=a[1]*d+a[5]*e+a[9]*b+a[13];c[2]=a[2]*d+a[6]*e+a[10]*b+a[14];return c};
mat4.multiplyVec4=function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2];b=b[3];c[0]=a[0]*d+a[4]*e+a[8]*g+a[12]*b;c[1]=a[1]*d+a[5]*e+a[9]*g+a[13]*b;c[2]=a[2]*d+a[6]*e+a[10]*g+a[14]*b;c[3]=a[3]*d+a[7]*e+a[11]*g+a[15]*b;return c};
mat4.translate=function(a,b,c){var d=b[0],e=b[1];b=b[2];if(!c||a==c){a[12]=a[0]*d+a[4]*e+a[8]*b+a[12];a[13]=a[1]*d+a[5]*e+a[9]*b+a[13];a[14]=a[2]*d+a[6]*e+a[10]*b+a[14];a[15]=a[3]*d+a[7]*e+a[11]*b+a[15];return a}var g=a[0],f=a[1],h=a[2],i=a[3],j=a[4],k=a[5],l=a[6],o=a[7],m=a[8],n=a[9],p=a[10],r=a[11];c[0]=g;c[1]=f;c[2]=h;c[3]=i;c[4]=j;c[5]=k;c[6]=l;c[7]=o;c[8]=m;c[9]=n;c[10]=p;c[11]=r;c[12]=g*d+j*e+m*b+a[12];c[13]=f*d+k*e+n*b+a[13];c[14]=h*d+l*e+p*b+a[14];c[15]=i*d+o*e+r*b+a[15];return c};
mat4.scale=function(a,b,c){var d=b[0],e=b[1];b=b[2];if(!c||a==c){a[0]*=d;a[1]*=d;a[2]*=d;a[3]*=d;a[4]*=e;a[5]*=e;a[6]*=e;a[7]*=e;a[8]*=b;a[9]*=b;a[10]*=b;a[11]*=b;return a}c[0]=a[0]*d;c[1]=a[1]*d;c[2]=a[2]*d;c[3]=a[3]*d;c[4]=a[4]*e;c[5]=a[5]*e;c[6]=a[6]*e;c[7]=a[7]*e;c[8]=a[8]*b;c[9]=a[9]*b;c[10]=a[10]*b;c[11]=a[11]*b;c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15];return c};
mat4.rotate=function(a,b,c,d){var e=c[0],g=c[1];c=c[2];var f=Math.sqrt(e*e+g*g+c*c);if(!f)return null;if(f!=1){f=1/f;e*=f;g*=f;c*=f}var h=Math.sin(b),i=Math.cos(b),j=1-i;b=a[0];f=a[1];var k=a[2],l=a[3],o=a[4],m=a[5],n=a[6],p=a[7],r=a[8],s=a[9],A=a[10],B=a[11],t=e*e*j+i,u=g*e*j+c*h,v=c*e*j-g*h,w=e*g*j-c*h,x=g*g*j+i,y=c*g*j+e*h,z=e*c*j+g*h;e=g*c*j-e*h;g=c*c*j+i;if(d){if(a!=d){d[12]=a[12];d[13]=a[13];d[14]=a[14];d[15]=a[15]}}else d=a;d[0]=b*t+o*u+r*v;d[1]=f*t+m*u+s*v;d[2]=k*t+n*u+A*v;d[3]=l*t+p*u+B*
v;d[4]=b*w+o*x+r*y;d[5]=f*w+m*x+s*y;d[6]=k*w+n*x+A*y;d[7]=l*w+p*x+B*y;d[8]=b*z+o*e+r*g;d[9]=f*z+m*e+s*g;d[10]=k*z+n*e+A*g;d[11]=l*z+p*e+B*g;return d};mat4.rotateX=function(a,b,c){var d=Math.sin(b);b=Math.cos(b);var e=a[4],g=a[5],f=a[6],h=a[7],i=a[8],j=a[9],k=a[10],l=a[11];if(c){if(a!=c){c[0]=a[0];c[1]=a[1];c[2]=a[2];c[3]=a[3];c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15]}}else c=a;c[4]=e*b+i*d;c[5]=g*b+j*d;c[6]=f*b+k*d;c[7]=h*b+l*d;c[8]=e*-d+i*b;c[9]=g*-d+j*b;c[10]=f*-d+k*b;c[11]=h*-d+l*b;return c};
mat4.rotateY=function(a,b,c){var d=Math.sin(b);b=Math.cos(b);var e=a[0],g=a[1],f=a[2],h=a[3],i=a[8],j=a[9],k=a[10],l=a[11];if(c){if(a!=c){c[4]=a[4];c[5]=a[5];c[6]=a[6];c[7]=a[7];c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15]}}else c=a;c[0]=e*b+i*-d;c[1]=g*b+j*-d;c[2]=f*b+k*-d;c[3]=h*b+l*-d;c[8]=e*d+i*b;c[9]=g*d+j*b;c[10]=f*d+k*b;c[11]=h*d+l*b;return c};
mat4.rotateZ=function(a,b,c){var d=Math.sin(b);b=Math.cos(b);var e=a[0],g=a[1],f=a[2],h=a[3],i=a[4],j=a[5],k=a[6],l=a[7];if(c){if(a!=c){c[8]=a[8];c[9]=a[9];c[10]=a[10];c[11]=a[11];c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15]}}else c=a;c[0]=e*b+i*d;c[1]=g*b+j*d;c[2]=f*b+k*d;c[3]=h*b+l*d;c[4]=e*-d+i*b;c[5]=g*-d+j*b;c[6]=f*-d+k*b;c[7]=h*-d+l*b;return c};
mat4.frustum=function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=e*2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=e*2/i;f[6]=0;f[7]=0;f[8]=(b+a)/h;f[9]=(d+c)/i;f[10]=-(g+e)/j;f[11]=-1;f[12]=0;f[13]=0;f[14]=-(g*e*2)/j;f[15]=0;return f};mat4.perspective=function(a,b,c,d,e){a=c*Math.tan(a*Math.PI/360);b=a*b;return mat4.frustum(-b,b,-a,a,c,d,e)};
mat4.ortho=function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=2/i;f[6]=0;f[7]=0;f[8]=0;f[9]=0;f[10]=-2/j;f[11]=0;f[12]=-(a+b)/h;f[13]=-(d+c)/i;f[14]=-(g+e)/j;f[15]=1;return f};
mat4.lookAt=function(a,b,c,d){d||(d=mat4.create());var e=a[0],g=a[1];a=a[2];var f=c[0],h=c[1],i=c[2];c=b[1];var j=b[2];if(e==b[0]&&g==c&&a==j)return mat4.identity(d);var k,l,o,m;c=e-b[0];j=g-b[1];b=a-b[2];m=1/Math.sqrt(c*c+j*j+b*b);c*=m;j*=m;b*=m;k=h*b-i*j;i=i*c-f*b;f=f*j-h*c;if(m=Math.sqrt(k*k+i*i+f*f)){m=1/m;k*=m;i*=m;f*=m}else f=i=k=0;h=j*f-b*i;l=b*k-c*f;o=c*i-j*k;if(m=Math.sqrt(h*h+l*l+o*o)){m=1/m;h*=m;l*=m;o*=m}else o=l=h=0;d[0]=k;d[1]=h;d[2]=c;d[3]=0;d[4]=i;d[5]=l;d[6]=j;d[7]=0;d[8]=f;d[9]=
o;d[10]=b;d[11]=0;d[12]=-(k*e+i*g+f*a);d[13]=-(h*e+l*g+o*a);d[14]=-(c*e+j*g+b*a);d[15]=1;return d};mat4.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+", "+a[9]+", "+a[10]+", "+a[11]+", "+a[12]+", "+a[13]+", "+a[14]+", "+a[15]+"]"};quat4={};quat4.create=function(a){var b=new glMatrixArrayType(4);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3]}return b};quat4.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];return b};
quat4.calculateW=function(a,b){var c=a[0],d=a[1],e=a[2];if(!b||a==b){a[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e));return a}b[0]=c;b[1]=d;b[2]=e;b[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e));return b};quat4.inverse=function(a,b){if(!b||a==b){a[0]*=1;a[1]*=1;a[2]*=1;return a}b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];b[3]=a[3];return b};quat4.length=function(a){var b=a[0],c=a[1],d=a[2];a=a[3];return Math.sqrt(b*b+c*c+d*d+a*a)};
quat4.normalize=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=Math.sqrt(c*c+d*d+e*e+g*g);if(f==0){b[0]=0;b[1]=0;b[2]=0;b[3]=0;return b}f=1/f;b[0]=c*f;b[1]=d*f;b[2]=e*f;b[3]=g*f;return b};quat4.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2];a=a[3];var f=b[0],h=b[1],i=b[2];b=b[3];c[0]=d*b+a*f+e*i-g*h;c[1]=e*b+a*h+g*f-d*i;c[2]=g*b+a*i+d*h-e*f;c[3]=a*b-d*f-e*h-g*i;return c};
quat4.multiplyVec3=function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2];b=a[0];var f=a[1],h=a[2];a=a[3];var i=a*d+f*g-h*e,j=a*e+h*d-b*g,k=a*g+b*e-f*d;d=-b*d-f*e-h*g;c[0]=i*a+d*-b+j*-h-k*-f;c[1]=j*a+d*-f+k*-b-i*-h;c[2]=k*a+d*-h+i*-f-j*-b;return c};quat4.toMat3=function(a,b){b||(b=mat3.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c=c*i;var l=d*h;d=d*i;e=e*i;f=g*f;h=g*h;g=g*i;b[0]=1-(l+e);b[1]=k-g;b[2]=c+h;b[3]=k+g;b[4]=1-(j+e);b[5]=d-f;b[6]=c-h;b[7]=d+f;b[8]=1-(j+l);return b};
quat4.toMat4=function(a,b){b||(b=mat4.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c=c*i;var l=d*h;d=d*i;e=e*i;f=g*f;h=g*h;g=g*i;b[0]=1-(l+e);b[1]=k-g;b[2]=c+h;b[3]=0;b[4]=k+g;b[5]=1-(j+e);b[6]=d-f;b[7]=0;b[8]=c-h;b[9]=d+f;b[10]=1-(j+l);b[11]=0;b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};quat4.slerp=function(a,b,c,d){d||(d=a);var e=c;if(a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3]<0)e=-1*c;d[0]=1-c*a[0]+e*b[0];d[1]=1-c*a[1]+e*b[1];d[2]=1-c*a[2]+e*b[2];d[3]=1-c*a[3]+e*b[3];return d};
quat4.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+"]"};

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
    if (location == -1 || location == null) throw new Error("Uniform location for uniform '"+uniform.name+"' could not be found!");
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
      if (typeof(value) == "function") value = value(context, mesh);
      var location = getUniformLocation(this, context, uniform);

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
        diffuse:  options.colors.diffuse  || [0.8, 0.8, 0.8],
        ambient:  options.colors.ambient  || [0.8, 0.8, 0.8],
        specular: options.colors.specular || [1.0, 1.0, 1.0],
        emissive: options.colors.emissive || [0.0, 0.0, 0.0]
      };

      this.specular   = typeof(options.specular)   == "undefined" ?    0    : options.specular;
      this.softness   = typeof(options.softness)   == "undefined" ?    0.1  : options.softness;
      this.glossiness = typeof(options.glossiness) == "undefined" ?   10    : options.glossiness;
      this.opacity    = typeof(options.opacity)    == "undefined" ?    1.0  : options.opacity;
      this.shaderType = typeof(options.shaderType) == "undefined" ? "phong" : options.shaderType;
    },

    render: function(context, mesh, options) {
      if (this.isChanged()) compile(this, context);
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
Jax.Material.create('default' , {shaderType: 'color_without_texture'});
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

      if (!self.gl) return;

      each_gl_buffer(self, function(context, buffer) {
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
        buffer.numItems = buffer.length = this.js.length;
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
      this.matrices = { mv: mat4.create(), p : mat4.create(), n : mat4.create() };
      this.reset();
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
      switch(arguments.length) {
        case 2: mat4.lookAt(storeVecBuf(this, POSITION), arguments[0], arguments[1], this.matrices.mv); break;
        case 3: mat4.lookAt(arguments[2], arguments[0], arguments[1], this.matrices.mv); break;
        case 6: mat4.lookAt(storeVecBuf(this, POSITION),
                            [arguments[0], arguments[1], arguments[2]],
                            [arguments[3], arguments[4], arguments[5]],
                            this.matrices.mv); break;
        case 9: mat4.lookAt([arguments[6], arguments[7], arguments[8]],
                            [arguments[0], arguments[1], arguments[2]],
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

    getModelViewMatrix: function() {
      return this.matrices.mv;
    },

    getProjectionMatrix: function() {
      return this.matrices.p;
    },

    unproject: function(winx, winy, winz) {
      if (typeof(winz) == "number") {
        winx = parseFloat(winx);
        winy = parseFloat(winy);
        winz = parseFloat(winz);

        var inf = [];
        var mm = this.matrices.mv, pm = this.matrices.p;
        var viewport = [0, 0, pm.width, pm.height];


        var m = mat4.multiply(pm, mm, mat4.create());
        mat4.inverse(m);

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
      var amount = arguments.shift();
      var vec;
      switch(arguments.length) {
        case 2: vec = arguments[1]; break;
        case 4: vec = vec3.create(arguments); break;
        default: throw new Error("Invalid arguments");
      }

      if      (vec[1] == 0 && vec[2] == 0) mat4.rotateX(this.matrices.mv, amount*vec[0], this.matrices.mv);
      else if (vec[0] == 0 && vec[2] == 0) mat4.rotateY(this.matrices.mv, amount*vec[1], this.matrices.mv);
      else if (vec[0] == 0 && vec[1] == 0) mat4.rotateZ(this.matrices.mv, amount*vec[2], this.matrices.mv);
      else                                 mat4.rotate (this.matrices.mv, amount,   vec, this.matrices.mv);
      this.fireEvent('updatedMatrix');
      return this;
    },

    strafe: function(distance) {
      mat4.translate(this.matrices.mv, vec3.scale(storeVecBuf(this, RIGHT), distance), this.matrices.mv);
      return this;
    },

    move: function(distance, direction) {
      direction = direction || storeVecBuf(this, VIEW);
      mat4.translate(this.matrices.mv, vec3.scale(direction, distance), this.matrices.mv);
    },

    reset: function() { this.orient([0,0,-1],[0,1,0],[0,0,0]); }
  });
})();

Jax.Camera.addMethods(Jax.Events.Methods);
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
      if (mouse.down && mouse.down.count)
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
        self.glViewport(0, 0, self.canvas.width, self.canvas.height);
        self.current_view.render();
        self.render_interval = setTimeout(render, Jax.render_speed);
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
    for (var i in self) {
      if (i.indexOf("gl") == 0) {
        /* it's a WebGL method */
        view[i] = eval("(function() { return this.context."+i+".apply(this.context, arguments); })");
      }
    }
    /* TODO we should set up helpers, etc. here too */
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
      if (Jax.routes.isRouted("/"))
        this.redirectTo("/");
    },

    redirectTo: function(path) {
      this.current_controller = Jax.routes.dispatch(path);
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

    getModelViewMatrix: function() {
      /* TODO replace this after implementing player and camera */
      return this.mvMatrix = this.mvMatrix || (function() {
        var mv = mat4.create();
        mat4.identity(mv);
        return mv;
      })();
    },

    getProjectionMatrix: function() {
      /* TODO replace this after implementing player and camera */
      var self = this;
      return this.pMatrix = this.pMatrix || (function() {
        var persp = mat4.create();
        mat4.perspective(45, self.canvas.width/self.canvas.height, 0.01, 200, persp);
        return persp;
      })();
    },

    getNormalMatrix: function() {
      /* TODO replace this after implementing player and camera */
      return this.nMatrix = this.nMatrix || (function() {
        var mv = mat4.create();
        mat4.identity(mv);
        return mv;
      })();
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

/*
  Failsafe shader - useful for debugging. Renders an object using vertex data only. The object's
  color is hard-coded to pure white.
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
            "  gl_FragColor = vec4(1,1,1,1);",
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
  function buildVertexSource(options) {
    var result = "";
    result = "attribute vec3 vertexPosition, vertexNormal, lightPosition;"
           + "uniform mat4 mvMatrix, pMatrix, nMatrix;"
           + "varying vec3 normal, lightDir, eyeVec;"

           + "void main() { "
           +   "normal = vec3(nMatrix * vec4(vertexNormal, 1));"
           +   "vec3 vVertex = vec3(mvMatrix * vec4(vertexPosition, 1));"
           +   "lightDir = vec3(lightPosition - vVertex);"
           +   "eyeVec = -vVertex;"
           +   "gl_Position = pMatrix * vec4(vertexPosition, 1);"
           + "}";
    return result;
  }

  function buildFragmentSource(options) {
    return ['varying vec3 normal, lightDir, eyeVec;',

            'void main(void) {',
            '  gl_FragColor = vec4(1,1,1,1);',
            '}'
    ];
  }

  return function(options) {
    return {
      vertex_source: buildVertexSource(options),
      fragment_source: buildFragmentSource(options),
      uniforms: {
        mvMatrix: {
          type: "glUniformMatrix4fv",
          value: function(context) { return context.getModelViewMatrix(); }
        },
        pMatrix: {
          type: "glUniformMatrix4fv",
          value: function(context) { return context.getProjectionMatrix(); }
        },
        nMatrix: {
          type: "glUniformMatrix4fv",
          value: function(context) { return context.getNormalMatrix(); }
        }
      }
    };
  }
})();

Jax.views = new Jax.ViewManager();

Jax.routes = new Jax.RouteSet();

Jax.loaded = true;

Jax.render_speed = 15;
