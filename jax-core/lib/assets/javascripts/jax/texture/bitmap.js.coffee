###

A basic 2D texture represented by an external bitmap, which will be loaded
asynchronously.

The `Image` can be an instance of `HTMLImageElement`, `HTMLCanvasElement`
or `HTMLVideoElement`. To pass other texture options, pass an object like so:

    new Jax.Texture.Bitmap({ data: image, other: options })

You can also pass a `path` option to point to an external image that has not
been loaded:

    new Jax.Texture.Bitmap({ path: "/path/to/image.png" })

###
class Jax.Texture.Bitmap extends Jax.Texture
  constructor: (image, options = null) ->
    @on 'change:path', @pathChanged
    @_isReady = true
    if options then options.data = image
    else options = image
    super options
    @set 'target', GL_TEXTURE_2D unless options?.target

  ###
  Callback to be fired whenever the `path` attribute changes. This loads
  a new `Image`, attaches listeners to it, etc.
  ###
  pathChanged: =>
    @_isReady = false
    image = new window.Image
    $(image).on 'load', =>
      @set 'width', image.width
      @set 'height', image.height
      @_isReady = true
    image.src = @get 'path'
    @set 'data', image

  upload: (context, handle, image) ->
    dataType = @get 'data_type'
    format = @get 'format'
    target = @get 'target'
    try
      context.renderer.texImage2D target, 0, format, format, dataType, image
    catch e
      # image has not yet loaded. Set ready to false for now, then flip it
      # when image is ready.
      @_isReady = false
      $(image).on 'load', =>
        @set 'width', image.naturalWidth
        @set 'height', image.naturalHeight
        @set 'data', image # to ensure a new upload
        @_isReady = true

  isReady: ->
    @_isReady
