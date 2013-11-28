###
The Popularity Contest is used by instances of `Jax.Shader` to determine the
best candidate for binding to vertex attribute 0.

In WebGL, vertex attribute 0 must always be bound and enabled. This is to
prevent costly emulation on certain hardware. In a lower-level application,
the developer would explicitly bind attribute 0 for each shader. In Jax, this
must be managed automatically since most developers do not concern themselves
with the individual shaders.

`Jax.Shader.PopularityContest` attempts to provide a better way to manage
attribute 0, by trying to auto-detect the ideal candidate to bind to slot 0.
It does this by presuming that most programmers follow a particular naming
convention. It does not matter what the naming convention is, so long as it
is followed. For example, vertex position data might be stored in an attribute
called `VERTEX_POSITION` or in an attribute called `a_VertexPosition`. The
popularity contest works because the more shaders that use the same name for
vertex position data, the more likely that this attribute will usually or
always be active. Thus, we can always bind a particular attribute to a
particular slot. The more popular the attribute, the less often `Jax.Shader`
has to explicitly enable or disable the attribute. Indeed, for common data
such as vertex positions, the attribute can be left permanently enabled and
permanently bound to slot 0, maximizing performance, assuming all shaders
name the vertex position data the same way.

The popularity contest is actually very simple. Whenever a new shader is
compiled, the attributes are sorted and bound to vertex array attribute slots
in order of popularity, so that the most popular vertex is bound to slot 0,
the second-most popular is bound to slot 1, etc.

Whenever a vertex attribute is _not_ used in a particular shader, it has to
be explicitly disabled by `Jax.Shader`. This makes it a not-ideal candidate,
and it instantly gets pushed to the back of the line, regardless of how
popular it otherwise is. It can still get bound to slot 0 (or some other
slot), but only if all other attributes are similarly rejected. With this
approach, it is hoped that at least one common attribute will be found across
all instances of `Jax.Shader`, and that common attribute will be bound to
slot 0.

NOTE: The popularity contest does not happen every frame. It only happens
during shader compilation, which is also the time at which attribute bindings
are specified. However, attributes can be disliked by a shader at any time
by virtue of having been disabled for any reason. Also, after the popularity
contest occurs, vertex attributes may still be enabled, disabled or re-bound
between rendering passes, depending on whether they are needed by the shader
in question. The purpose of this class is not to completely remove the need
for attribute toggling, only to reduce it as much as possible.
###
class Jax.Shader.PopularityContest
  _popularity = {}

  ###
  Resets all popularities globally. Does not affect whether an attribute was
  disliked by its shader.
  ###
  @reset: -> _popularity = {}

  constructor: ->
    @disliked = []
    @guid = Jax.guid()

  ###
  Sorts the given array of attribute names, then returns the sorted array.
  ###
  sort: (names) ->
    names.sort (a, b) =>
      a = a.toString()
      b = b.toString()
      da = @disliked.indexOf a
      db = @disliked.indexOf b
      # If either has ever been disliked, return the other.
      # If both have been disliked, sort by popularity anyways, because they
      # might still be candidates for binding if all others fail.
      if da isnt db
        if da is -1 then return -1
        else return 1
      apop = @getPopularity a
      bpop = @getPopularity b
      if dpop = bpop - apop
        return dpop
      # If popularity is the same, sort by name to make their order
      # predictable.
      a.toLowerCase().localeCompare b.toLowerCase()

  ###
  Returns the popularity of the specified name.
  ###
  getPopularity: (name) ->
    pop = _popularity[name]
    if pop then pop.length
    else 0

  ###
  Decreases the popularity of all attributes previously used by this instance,
  then increases the popularity of the given array of attribute names.
  ###
  popularize: (attributes) ->
    # decrease popularity of any variables previously used by this shader
    @decreaseAll()
    # increase popularity of all variables now used by this instance, which
    # have not been disabled during rendering
    for name in attributes
      @increase name
    true

  ###
  Decreases the global popularity of the specified attribute name, _even if_
  the specified attribute name has previously been disliked.
  ###
  decrease: (name) ->
    popularity = _popularity[name] or= []
    popularity.splice popularity.indexOf(@guid), 1

  ###
  Increases the global popularity of the specified attribute name, provided
  the specified attribute name has not been disliked by this instance of
  `Jax.Shader.PopularityContest`.
  ###
  increase: (name) ->
    return if @isDisliked name
    popularity = _popularity[name] or= []
    guid = @guid
    popularity.push guid unless popularity.indexOf(guid) isnt -1

  ###
  Dislikes the specified attribute name. This will cause requests to increase
  its popularity by this instance to be ignored. Other instances of
  `Jax.Shader.PopularityContest` are not affected.
  ###
  dislike: (name) -> @disliked.push name

  ###
  Returns true if the specified attribute name has been disliked by this
  instance.
  ###
  isDisliked: (name) -> @disliked.indexOf(name) isnt -1

  ###
  Decreases the global popularity of every attribute whose popularity has been
  increased by this specific instance.
  ###
  decreaseAll: ->
    guid = @guid
    for name, popularity of _popularity
      popularity.splice popularity.indexOf(guid), 1
    true
