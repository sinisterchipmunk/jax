describe("Prototype extensions:", function() {
  describe("Class", function() {
    var klass;
    var subklass;
      
    beforeEach(function() {
      klass = Class.create({ });
      subklass = Class.create(klass, {});
    });

    it("should be a kind of itself", function() {
      expect(new klass()).toBeKindOf(klass);
    });
    
    it("should not be a kind of its subclass", function() {
      expect(new klass()).not.toBeKindOf(subklass);
    });
    
    describe("Subclass", function() {
      it("should be a kind of itself", function() {
        expect(new subklass()).toBeKindOf(subklass);
      });

      it("should be a kind of its superclass", function() {
        expect(new subklass()).toBeKindOf(subklass.superclass);
      });
      
      /* theoretically the same as above, but... */
      it("should be a kind of klass", function() {
        expect(new subklass()).toBeKindOf(klass);
      });
    });
  });
});
