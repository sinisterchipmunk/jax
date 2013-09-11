describe 'Jax.Texture.CubeMap', ->
  beforeEach ->
    @cubeTex = new Jax.Texture.CubeMap
      left:   @left   = new Jax.Texture
      right:  @right  = new Jax.Texture
      top:    @top    = new Jax.Texture
      bottom: @bottom = new Jax.Texture
      near:   @near   = new Jax.Texture
      far:    @far    = new Jax.Texture

  it 'should bind each texture to the specified axes', ->
    spyOn @context.renderer, 'texImage2D'
    @cubeTex.validate @context
    expect(@context.renderer.texImage2D.calls.length).toEqual 6

  it 'should set each textures bind target', ->
    expect(@left.get   'target').toEqual GL_TEXTURE_CUBE_MAP_NEGATIVE_X
    expect(@right.get  'target').toEqual GL_TEXTURE_CUBE_MAP_POSITIVE_X
    expect(@top.get    'target').toEqual GL_TEXTURE_CUBE_MAP_POSITIVE_Y
    expect(@bottom.get 'target').toEqual GL_TEXTURE_CUBE_MAP_NEGATIVE_Y
    expect(@near.get   'target').toEqual GL_TEXTURE_CUBE_MAP_POSITIVE_Z
    expect(@far.get    'target').toEqual GL_TEXTURE_CUBE_MAP_NEGATIVE_Z
