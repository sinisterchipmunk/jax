# Can be mixed into any object which maintains a set of arbitrarily-named
# attributes. In the constructor of such objects, you must call
# `@initializeAttributes()` before `set` or `get` can be used.
#
Jax.Mixins.Attributes = 
  initializeAttributes: ->
    @attributes = {}
    @previousAttributes = {}

  # Sets an attribute with the given name, to the given value.
  # Before setting the new value, the old value is copied into
  # `@previousAttributes`. If this object also mixes in
  # `Jax.Mixins.EventEmitter`, an event is triggered with the form
  # 'change:name', where 'name' is the given attribute name.
  set: (name, value) ->
    @previousAttributes[name] = @attributes[name]
    @attributes[name] = value
    @trigger? "change:#{name}", this
    value

  # Returns the value of the attribute with the given name, or `undefined`
  # if it has no current value.
  get: (name) -> @attributes[name]

  # Returns the previous value of the named attribute, or `undefined` if it
  # has never been replaced with any other value.
  getPrevious: (name) -> @previousAttributes[name]
