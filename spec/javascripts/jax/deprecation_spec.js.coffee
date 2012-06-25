describe "Jax.deprecate", ->
  Obj = null
  obj = null

  beforeEach ->
    Jax.deprecate.level = 0
    class Obj
      something: -> 0
      something_else: -> 2
      prop1: 1
      prop2: 2
      a: -> 0
      b: 1
      obj2:
        a: -> 1
        b: 2
    obj = new Obj
    Jax.deprecate Obj, 'something', 'something_else'
    Jax.deprecateProperty Obj, 'prop1', 'prop2'
    Jax.deprecate Obj, 'a', 'obj2.a'
    Jax.deprecateProperty Obj, 'b', 'obj2.b'
    spyOn console, 'log'
    
  afterEach -> Jax.deprecate.level = 1
  
  it "should return replacements for deprecated properties", ->
    expect(obj.prop1).toEqual 2
    
  it "should delegate function periods into its own objects", ->
    expect(obj.a()).toEqual 1
  
  it "should delegate property periods into its own objects", ->
    expect(obj.b).toEqual 2

  it "should return the result of the new method", ->
    expect(obj.something 1).toEqual 2
    
  it "should log a message to the console", ->
    obj.something 1
    expect(console.log).toHaveBeenCalledWith(
      "`Obj#something` has been deprecated. Please use `Obj#something_else` instead."
    )
  
  it "should call the new method", ->
    spyOn obj, 'something_else'
    obj.something 1, obj
    expect(obj.something_else).toHaveBeenCalledWith(1, obj)
    
  it "should raise an error if new method is null", ->
    Jax.deprecate Obj, 'something', null
    expect(-> obj.something 1, obj).toThrow("`Obj#something` has been deprecated. Please see the documentation.")
  
  it "should replace the message if given", ->
    Jax.deprecate Obj, 'something', 'something_else', 'message'
    obj.something 1
    expect(console.log).toHaveBeenCalledWith 'message'
  