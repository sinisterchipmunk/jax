describe("Prototype extensions:", function() {
  describe("Class", function() {
    var klass;
    var subklass;
      
    beforeEach(function() {
      klass = Jax.Class.create({ });
      subklass = Jax.Class.create(klass, {});
    });

    it("should be a kind of itself", function() {
      expect(new klass()).toBeInstanceOf(klass);
    });
    
    it("should not be a kind of its subclass", function() {
      expect(new klass()).not.toBeInstanceOf(subklass);
    });
    
    describe("Subclass", function() {
      it("should be a kind of itself", function() {
        expect(new subklass()).toBeInstanceOf(subklass);
      });

      it("should be a kind of klass", function() {
        expect(new subklass()).toBeInstanceOf(klass);
      });
    });
  });
});
