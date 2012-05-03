describe "Jax.deprecate", ->
  Obj = null
  obj = null

  beforeEach ->
    class Obj
      something: -> 0
      something_else: -> 2
    obj = new Obj
    Jax.deprecate Obj, 'something', 'something_else'
  
  it "should return the result of the new method", ->
    expect(obj.something 1).toEqual 2
    
  it "should log a message to the console", ->
    spyOn console, 'log'
    obj.something 1
    expect(console.log).toHaveBeenCalledWith(
      "`Obj.something` has been deprecated. Please use `Obj.something_else` instead."
    )
  
  it "should call the new method", ->
    spyOn obj, 'something_else'
    obj.something 1, obj
    expect(obj.something_else).toHaveBeenCalledWith(1, obj)
    
  it "should raise an error if new method is null", ->
    Jax.deprecate Obj, 'something', null
    expect(-> obj.something 1, obj).toThrow("`Obj.something` has been deprecated. Please see the documentation.")
  
  it "should replace the message if given", ->
    Jax.deprecate Obj, 'something', 'something_else', 'message'
    spyOn console, 'log'
    obj.something 1
    expect(console.log).toHaveBeenCalledWith 'message'
  