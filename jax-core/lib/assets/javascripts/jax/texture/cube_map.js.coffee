###

Usually used for environment mapping, a cube map binds a different texture
to each of 6 sides: `left`, `right`, `top`, `bottom`, `near` and `far`.

The cube map will only be used if all 6 sides have a bound instance of
`Jax.Texture` or one of its subclasses, and each instance is itself ready to
be used.

Usage example:

    new Jax.Texture.CubeMap
      left:   new Jax.Texture.Bitmap(...)
      right:  new Jax.Texture.Bitmap(...)
      top:    new Jax.Texture.Bitmap(...)
      bottom: new Jax.Texture.Bitmap(...)
      near:   new Jax.Texture.Bitmap(...)
      far:    new Jax.Texture.Bitmap(...)

###
class Jax.Texture.CubeMap extends Jax.Texture
  constructor: (options) ->
    @on 'change:left   change:right change:top
         change:bottom change:near  change:far', @dirChanged
    options.target = GL_TEXTURE_CUBE_MAP
    super options

  dirChanged: (self, eventName) =>
    data = @get('data') || {}
    switch eventName
      when 'change:left'
        data.left = @get 'left'
        data.left.set 'target',   GL_TEXTURE_CUBE_MAP_NEGATIVE_X
      when 'change:right'
        data.right = @get 'right'
        data.right.set 'target',  GL_TEXTURE_CUBE_MAP_POSITIVE_X
      when 'change:top'
        data.top = @get 'top'
        data.top.set 'target',    GL_TEXTURE_CUBE_MAP_POSITIVE_Y
      when 'change:bottom'
        data.bottom = @get 'bottom'
        data.bottom.set 'target', GL_TEXTURE_CUBE_MAP_NEGATIVE_Y
      when 'change:near'
        data.near = @get 'near'
        data.near.set 'target',   GL_TEXTURE_CUBE_MAP_POSITIVE_Z
      when 'change:far'
        data.far = @get 'far'
        data.far.set 'target',    GL_TEXTURE_CUBE_MAP_NEGATIVE_Z
    @set 'data', data

  upload: (context, handle, data) =>
    {left, right, top, bottom, near, far} = data
    left.upload   context, handle, data
    right.upload  context, handle, data
    top.upload    context, handle, data
    bottom.upload context, handle, data
    near.upload   context, handle, data
    far.upload    context, handle, data

  isReady: =>
    data = @get 'data'
    data && data.left?.isReady() && data.right?.isReady()  &&
            data.top?.isReady()  && data.bottom?.isReady() &&
            data.near?.isReady() && data.far?.isReady()
