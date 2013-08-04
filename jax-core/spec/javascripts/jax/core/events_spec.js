describe("Jax.EventEmitter", function() {
  var emitter, evt, listenerID;
  
  beforeEach(function() {
    emitter = Jax.Class.create({ });
    emitter.addMethods(Jax.EventEmitter);
    emitter = new emitter();
    listenerID = emitter.on('evt', function(obj) { evt = obj; });
  });
  
  // don't taint other tests
  afterEach(function() { evt = undefined; });
  
  it("should pass events to listeners", function() {
    var result = false;
    emitter.on('evt', function(evt) { result = evt; });
    emitter.trigger('evt', 1);
    expect(result).toBeTruthy();
  });

  it("should work with no event at all", function() {
    evt = 1;
    emitter.trigger('evt');
    expect(evt).toBeUndefined();
  });

  it("should trigger higher scopes on scoped events", function() {
    emitter.trigger('evt:two', 1);
    expect(evt).toEqual(1);
  });
  
  it("should be un-listenenable", function() {
    emitter.off('evt', listenerID);
    emitter.trigger('evt', {});
    expect(evt).toBeUndefined(); // because the original listener never was fired
  });

  describe("off() with no args", function() {
    beforeEach(function() { emitter.off(); });

    it("should remove the listener", function() {
      emitter.trigger('evt', {});
      expect(evt).toBeUndefined();
    });
  });
});
