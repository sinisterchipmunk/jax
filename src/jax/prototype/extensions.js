/* My own custom extensions to Prototype */

//= require "class"

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
  //Class.Methods.isKindOf = function(what) {
  //};
})();
