describe("Jax.Events", function() {
  describe("Methods", function() {
    var instance;
    beforeEach(function() {
      var klass = Jax.Class.create({});
      klass.addMethods(Jax.Events.Methods);
      instance = new klass();
    });
    
    it("should pass events to listeners", function() {
      var result = false;
      instance.addEventListener('evt', function(evt) { result = evt; });
      instance.fireEvent('evt', 1);
      expect(result).toBeTruthy();
    });
  });
});