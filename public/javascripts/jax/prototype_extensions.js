(function() {
  /*
    Prototype doesn't seem to have a way to add instance methods to all classes (a generic base object would have
    been nice) so we have to hack it in by aliasing ::create and then replacing it.
  */
  Class.InstanceMethods = Class.InstanceMethods || {};

  Class.InstanceMethods.isKindOf = function(klass) {
    return(this instanceof klass);
  };

  var original_create = Class.create;
  Class.create = function() {
    var klass = original_create.apply(Class, arguments);
    klass.addMethods(Class.InstanceMethods);
    return klass;
  };

  /* for adding class methods only */
  //Class.Methods.isKindOf = function(what) {
  //};
})();
