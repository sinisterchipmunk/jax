//= require "jax/prototype/class"

(function() {
  /*
    Delegator is instantiated by the class method #delegate with _this_ and _arguments_ as arguments.
    It is effectively responsible for copying a set of methods into the destination object.
    
    @see Jax.Class.Methods#delegate
   */
  var Delegator = Jax.Class.create({
    initialize: function(target, methods) {
      throw new Error("Delegator has been phased out, please don't call it (with "+JSON.stringify(target)+", "+JSON.stringify(methods)+")");
      this.methods = methods;
      this.target = target;
    },
    
    into: function(destination, dest_klass) {
      /*
        yes, we're using eval in here. But as this method is only called during setup, it's probably OK for the most
        part. Note the caveat that if dest_klass is omitted and the dev is using regular expressions to match method
        names, we have no choice but to put an eval into the alias chain for this.target#initialize. Not ideal but I
        couldn't think of a better way to make it work.
       */
      var methods = {};
      var method_name;
      var alias_chain_regexps = [];
      
      for (var i = 0; i < this.methods.length; i++) {
        if (typeof(this.methods[i]) == "string") {
          /* it's not a regexp so this case is pretty straightforward */
          method_name = this.methods[i];
          methods[method_name] =
            eval("(function() { return this."+destination+"."+method_name+".apply(this."+destination+", arguments); })");
        } else if (this.methods[i].test) {
          var method_regexp = this.methods[i];
          /*
            regexp -- this is harder because we don't know what klass _destination_ points to.
            we have two choices: require an explicit klass argument, or assume the dev is prepared
            to pay the overhead price of testing regexps and calling #eval within #initialize.
            
            let's do both: if explicit klass was given, use it. Else, set up an alias chain for #initialize.
           */
          
          if (dest_klass) {
            for (method_name in dest_klass.prototype) {
              if (method_regexp.test(method_name)) {
                methods[method_name] =
                        eval("(function() { return this."+destination+"."+method_name+".apply(this."+destination+", arguments); })");
              }
            }
          } else {
            alias_chain_regexps.push(method_regexp);
          }
        }
      }

      /* add known methods */
      this.target.addMethods(methods);
      
      if (alias_chain_regexps.length > 0) {
        if (!this.target.alias_chain_regexps)
        {
          /* alias chain doesn't yet exist -- create it */
          this.target.alias_chain_regexps = {};
          var original_initialize_method = this.target.prototype.initialize;
          var fn = "(function(){" +
                     "if (original_initialize_method) original_initialize_method.apply(this, arguments);" +
                     "var i, j, method_name, destination, method_regexp, self = this;" +
                  
                     "destination = this."+destination+";" +
                     "for (i = 0; i < this.klass.alias_chain_regexps['"+destination+"'].length; i++) {" +
                       "method_regexp = this.klass.alias_chain_regexps['"+destination+"'][i];" +
                       "for (j in destination) {" +
                         "method_name = j;" +
                         "if (method_regexp.test(method_name)) " +
                           "this[method_name] = eval('(function(){return self."+destination+".'+method_name+" +
                                                    "'.apply(self."+destination+", arguments);})');" +
                       "}" +
                     "}" +
                  "})";
          
          this.target.prototype.initialize = eval(fn);
        }
        /* else, alias chain exists; we only have to add method regexps */
        
        this.target.alias_chain_regexps[destination] = this.target.alias_chain_regexps[destination] || [];
        for (i = 0; i < alias_chain_regexps.length; i++) {
          this.target.alias_chain_regexps[destination].push(alias_chain_regexps[i]);
        }
      }
    }
  });
    
  /*
    Prototype doesn't seem to have a way to add instance methods to all classes (a generic base object would have
    been nice) so we have to hack it in by aliasing ::create and then replacing it.
  */
  Jax.Class.InstanceMethods = {
    isKindOf: function() { throw new Error("isKindOf is deprecated; please use instanceof instead."); }
  };

  var original_create = Jax.Class.create;
  Jax.Class.create = function() {
    var klass = original_create.apply(Jax.Class, arguments);
    klass.prototype.klass = klass;
    klass.addMethods(Jax.Class.InstanceMethods);

    return klass;
  };
  
  /**
   * Jax.Class.delegate() -> undefined
   *
   * This is a class method of all Jax classes.
   *
   * Delegates one or more methods into properties of the class. For instance,
   * the following:
   * 
   *     MyClass.delegate("sayHello").into("person");
   *
   * will create a +sayHello+ method in the +MyClass+ class that internally calls
   * 
   *     this.person.sayHello(...)
   *
   * and returns the results.
   *
   * There are several other variants:
   *
   *     klass.delegate(/regular expression/).into("property_name");
   *       // delegates any method name in +property_name+ that matches the expression
   * 
   *     klass.delegate("one", "two").into("property_name");
   *       // delegates both 'one' and 'two' methods into +property_name+
   *
   *
   **/
  Jax.Class.Methods.delegate = function() {
    return new Delegator(this, arguments);
  };
})();
