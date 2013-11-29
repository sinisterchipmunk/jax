describe 'Jax.Color.Group', ->
  beforeEach -> @group = new Jax.Color.Group 'ambient', 'diffuse', 'specular'

  it 'should create a color for each name', ->
    expect(@group.ambient ).toBeInstanceOf Jax.Color
    expect(@group.diffuse ).toBeInstanceOf Jax.Color
    expect(@group.specular).toBeInstanceOf Jax.Color

  it 'should create a unique color for each name', ->
    expect(@group.ambient).not.toBe @group.diffuse
    expect(@group.ambient).not.toBe @group.specular
    expect(@group.diffuse).not.toBe @group.specular

  it 'should assign all colors to the same string value', ->
    @group.setAll '#fff'
    expect(@group.ambient .toString()).toEqual '#ffffffff'
    expect(@group.diffuse .toString()).toEqual '#ffffffff'
    expect(@group.specular.toString()).toEqual '#ffffffff'

  it 'should assign all colors to the same color value but not the same instance', ->
    @group.setAll new Jax.Color '#fff'
    expect(@group.ambient .toString()).toEqual '#ffffffff'
    expect(@group.diffuse .toString()).toEqual '#ffffffff'
    expect(@group.specular.toString()).toEqual '#ffffffff'
    expect(@group.ambient).not.toBe @group.diffuse
    expect(@group.ambient).not.toBe @group.specular
    expect(@group.diffuse).not.toBe @group.specular

  it 'should assign all colors to an object representing each component', ->
    @group.setAll
      ambient: '#111'
      diffuse: '#222'
      specular: '#333'
    expect(@group.ambient .toString()).toEqual '#111111ff'
    expect(@group.diffuse .toString()).toEqual '#222222ff'
    expect(@group.specular.toString()).toEqual '#333333ff'
