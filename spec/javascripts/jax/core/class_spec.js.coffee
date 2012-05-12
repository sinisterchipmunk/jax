describe "Jax.Class", ->
  K1 = K2 = K3 = null
  
  describe "instanceof", ->
    beforeEach ->
      K1 = Jax.Class.create {}
      K2 = Jax.Class.create {}
      K3 = Jax.Class.create K1, {}
      
    it "K3 should be instanceof K3", ->
      expect(new K3() instanceof K3).toBeTrue()
      
    it "K3 should be instanceof K1", ->
      expect(new K3() instanceof K1).toBeTrue()
    
    it "K3 should not be instanceof K2", ->
      expect(new K3() instanceof K2).toBeFalsy()
      
    it "K2 should not be instanceof K1", ->
      expect(new K2() instanceof K1).toBeFalsy()
      
    it "K1 should not be instanceof K3", ->
      expect(new K1() instanceof K3).toBeFalsy()
      
  describe "inheritance from Coffee class", ->
    beforeEach ->
      class K1
        constructor: -> @a = 1
      K2 = Jax.Class.create K1, initialize: ($super) -> $super(); @b = 2
    
    it "should call superclass initialize", ->
      expect(new K2().a).toEqual 1
      
    it "should call subclass initialize", ->
      expect(new K2().b).toEqual 2
  
  describe "inheritance into Coffee class", ->  
    beforeEach ->
      K1 = Jax.Class.create initialize: -> @a = 1
      class K2 extends K1
        constructor: -> super(); @b = 2
    
    it "should call superclass initialize", ->
      expect(new K2().a).toEqual 1
      
    it "should call subclass initialize", ->
      expect(new K2().b).toEqual 2
  
      
  describe "inheritance from Jax.Class", ->
    beforeEach ->
      K1 = Jax.Class.create initialize: -> @a = 1
      K2 = Jax.Class.create K1, initialize: ($super) -> $super(); @b = 2
    
    it "should call superclass initialize", ->
      expect(new K2().a).toEqual 1
      
    it "should call subclass initialize", ->
      expect(new K2().b).toEqual 2