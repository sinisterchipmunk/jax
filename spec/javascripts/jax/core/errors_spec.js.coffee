describe "Jax.Error", ->
  class MyError extends Jax.Error
  
  it "should be an instance of Error", ->
    expect(new MyError()).toBeInstanceOf Error

  it "should be an instance of Jax.Error", ->
    expect(new MyError()).toBeInstanceOf Jax.Error
    
  it "should be an instance of its own class", ->
    expect(new MyError()).toBeInstanceOf MyError
    
  