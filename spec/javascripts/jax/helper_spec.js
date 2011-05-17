describe("Jax.Helper", function() {
  var helper;
  
  beforeEach(function() {
    helper = Jax.Helper.create({
      test_method: function() { return 1; }
    });
  });
  
  it("should define the helper in requesting controllers", function() {
    var controller = Jax.Controller.create({
      helpers: function() { return [helper]; }
    });
    expect(controller.prototype.test_method).toEqual(helper.test_method);
  });

  it("should not define the helper in non-requesting controllers", function() {
    var controller = Jax.Controller.create({});
    expect(controller.prototype.test_method).toBeUndefined();
  });

  it("should define the helper in requesting models", function() {
    var model = Jax.Class.create(Jax.Model, {
      helpers: function() { return [helper]; }
    });
    expect(model.prototype.test_method).toEqual(helper.test_method);
  });

  it("should not define the helper in non-requesting models", function() {
    var model = Jax.Class.create(Jax.Model, {});
    expect(model.prototype.test_method).toBeUndefined();
  });
});
