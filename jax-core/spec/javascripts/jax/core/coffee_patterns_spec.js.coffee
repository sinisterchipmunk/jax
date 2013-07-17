describe "Jax.Core.CoffeePatterns", ->
  it "include", ->
    mixin = { a: 1, b: -> return this.__proto__.constructor.name }
    class K
      @include mixin
    expect(new K().a).toEqual 1
    expect(new K().b()).toEqual 'K'
    
  it "extend", ->
    mixin = { a: 1, b: -> return this.__proto__.constructor.name }
    class K
      @extend mixin
    expect(K.a).toEqual 1
    expect(K.b()).toEqual 'Function'
    