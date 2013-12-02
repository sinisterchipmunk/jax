#= require jax/mixins/event_emitter

###
When a mesh is rendered by a particular material, attribute and uniform
variables must be sent to the graphics processor. Many of these values are
typically calculated on-the-fly. For example, the view matrix may be a
concatenation of numerous other matrices and may be unique per object to be
rendered.

Bindings are used to maintain state from one object to another so that such
calculations can be deferred until changes are actually made, and then cached
on a per-object basis so that other values assigned to the same shader
variables do not need to be recalculated every frame.

Examples:

    # The binding itself is normally created by `Jax.Material`, but can be
    # instantiated directly:
    binding = new Jax.Material.Binding @context, @model, @mesh
    
    # Listen for specific changes to an object, and set variables accordingly:
    binding.listen @model.camera, 'change', ->
      binding.set 'ModelView', @context.matrix_stack.getModelViewMatrix()

To help clarify, here is an outline of the intended workflow:

  1. Binding is created.
  2. Binding begins listening for events to fire on an object.
  3. Events fire on an object. This may happen any number of times. Each
     time an event fires, the listener notes that a call to the
     corresponding callback is pending.
  4. At some point, the object will be rendered by a material. When this
     happens, the material calls `prepare` on the `Binding`.
  5. The `prepare` method invokes all pending callbacks so that the
     variables assigned to the binding are ready to be sent to the graphics
     processor.
  6. The material performs a render pass.

Between rendering passes, if no events fire on the underlying object, the
callbacks will not be called. This should remove redundant processing from
the system.
###
class Jax.Material.Binding
  @include Jax.Mixins.EventEmitter

  ###
  A unique ID constructed from the context, model and mesh IDs. Used to
  identify bindings in a repeatable way.
  ###
  @guid: (context, model, mesh) -> "#{context.id}:#{model.id}:#{mesh.id}"

  constructor: (@context, @model, @mesh) ->
    ###
    The unique ID for this binding.
    ###
    @guid = Jax.Material.Binding.guid @context, @model, @mesh

    @_pending = {}
    @_assigns = {}
    @_prepareEvent =
      binding: this

  ###
  Listens for the specified event to be emitted from the specified object.
  This is not the same as simply calling `obj.on(event, ...)` because the
  specified callback is not invoked immediately. When the named event fires,
  `Binding` marks the callback as "ready to fire", and only actually calls it
  when the `prepare` method is called.
  ###
  listen: (obj, event, callback) =>
    guid = Jax.guid()
    @_pending[guid] = callback
    obj.on event, => @_pending[guid] = callback

  ###
  Prepares for the next rendering pass by firing callbacks attached to any
  events that have occurred since the last time `prepare` was called.
  ###
  prepare: (pass) =>
    for guid, callback of @_pending
      delete @_pending[guid]
      callback this, pass
    @_prepareEvent.pass = pass
    @trigger 'prepare', @_prepareEvent
    true

  ###
  Binds the mesh data. This should be called immediately prior to one or more
  `prepare` calls, which themselves should immediately precede `drawBuffers`
  or `drawArrays`.
  ###
  bindMesh: =>
    @mesh.data.bind @context

  ###
  Sets a named variable to a particular value. The assignment will persist
  within this `Jax.Material.Binding` until replaced, and will be sent to the
  graphics processor whenever the `Jax.Material` which controls this binding
  renders the mesh associated with this binding.

  If an array is specified as the value, it will be _copied_ instead of being
  passed by reference. This allows the contents of the specified array to
  change over time while not affecting the value within the binding. When
  an array is copied, its type will be `Float32Array` by default. Pass the
  array type as a third argument to this method if `Float32Array` is not the
  correct type.

  If the value does not have a length (e.g. it is not an array), then it will
  be passed by reference. Thus, values for objects such as `Jax.Color` do not
  need to be respecified when the color changes. If this is not the result you
  are looking for, pass `color.toVec4()` or the equivalent conversion as the
  value.
  ###
  set: (name, value, type = Float32Array) =>
    if value?.length
      @_assigns[name] or= new type value.length
      @_assigns[name].set value
    else @_assigns[name] = value

  ###
  Returns an object containing all assignments. This is a persistent object,
  so be careful when making changes to it.
  ###
  get: => @_assigns
