describe("ApplicationHelper", function() {
  var helper;

  beforeEach(function() {
    var klass = Jax.Class.create({helpers: function() { return [ApplicationHelper]; } });
    helper = new klass();
  });

  it("does something", function() {
    expect(1).toEqual(1);
  });
});
