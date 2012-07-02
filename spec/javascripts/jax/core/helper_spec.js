describe("Jax.Helper", function() {
  var helper;
  
  beforeEach(function() {
    helper = Jax.Helper.create({
      test_method: function() { return 1; }
    });
  });

  describe("with an array", function() {
    it("should define the helper in requesting controllers", function() {
      var controller = Jax.Controller.create({
        helpers: [helper]
      });
      expect(new controller().test_method).toEqual(helper.test_method);
    });

    it("should not define the helper in non-requesting controllers", function() {
      var controller = Jax.Controller.create({});
      expect(new controller().test_method).toBeUndefined();
    });

    it("should define the helper in requesting models", function() {
      var model = Jax.Class.create(Jax.Model, {
        helpers: [helper]
      });
      expect(new model().test_method).toEqual(helper.test_method);
    });

    it("should not define the helper in non-requesting models", function() {
      var model = Jax.Class.create(Jax.Model, {});
      expect(new model().test_method).toBeUndefined();
    });
  });
  
  describe("with a function", function() {
    it("should define the helper in requesting controllers", function() {
      var controller = Jax.Controller.create({
        helpers: function() { return [helper]; }
      });
      expect(new controller().test_method).toEqual(helper.test_method);
    });

    it("should not define the helper in non-requesting controllers", function() {
      var controller = Jax.Controller.create({});
      expect(new controller().test_method).toBeUndefined();
    });

    it("should define the helper in requesting models", function() {
      var model = Jax.Class.create(Jax.Model, {
        helpers: function() { return [helper]; }
      });
      expect(new model().test_method).toEqual(helper.test_method);
    });

    it("should not define the helper in non-requesting models", function() {
      var model = Jax.Class.create(Jax.Model, {});
      expect(new model().test_method).toBeUndefined();
    });
  });
});
