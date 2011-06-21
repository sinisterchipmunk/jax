describe("Jax.Context.Events", function() {
  // I don't want to tie to a specific # of listeners because of nuances like tracking
  // (move,down,up) for 'dragged' events; it stands to reason that each event should
  // require greater than 0 listeners, but not one of +every+ listener (totalling 6).

  describe("with no controller", function() {
    it("sanity check", function() { expect(SPEC_CONTEXT.current_controller).toBeUndefined(); });
    
    it("should have registered no event listeners", function() {
      expect(SPEC_CONTEXT.canvas.getEventListeners()).toBeEmpty();
    });
    
    describe("redirecting to a controller", function() {
      beforeEach(function() {
        /* TODO make this easier! No reason we can't autogen routes and possibly views. */
        var c = Jax.Controller.create('test', {
          index: function() { },
          mouse_pressed: function(evt) { }
        });
        Jax.views.push('test/index', function() { });
        Jax.routes.map('test/index', c, 'index');
        SPEC_CONTEXT.redirectTo('test');
      });
      
      it("should have registered listeners", function() {
        expect(SPEC_CONTEXT.canvas.getEventListeners().length).toBeGreaterThan(0);
        expect(SPEC_CONTEXT.canvas.getEventListeners().length).toBeLessThan(6);
      });
    });
  });
  
  function withListener(which, fn) {
    describe("with "+which, function() {
      beforeEach(function() {
        var c = Jax.Controller.create('test', { index: function() { } });
        c.prototype[which] = function(evt) { }
        Jax.views.push('test/index', function() { });
        Jax.routes.map('test/index', c, 'index');
        SPEC_CONTEXT.redirectTo('test');
      });

      describe("listener", fn);
    });
  }

  // test listeners individually.
  withListener('mouse_entered', function() {
    it("should have some listeners", function() {
      expect(SPEC_CONTEXT.canvas.getEventListeners().length).toBeGreaterThan(0);
      expect(SPEC_CONTEXT.canvas.getEventListeners().length).toBeLessThan(6);
    });
  });

  withListener('mouse_exited', function() {
    it("should have some listeners", function() {
      expect(SPEC_CONTEXT.canvas.getEventListeners().length).toBeGreaterThan(0);
      expect(SPEC_CONTEXT.canvas.getEventListeners().length).toBeLessThan(6);
    });
  });

  withListener('mouse_released', function() {
    it("should have some listeners", function() {
      expect(SPEC_CONTEXT.canvas.getEventListeners().length).toBeGreaterThan(0);
      expect(SPEC_CONTEXT.canvas.getEventListeners().length).toBeLessThan(6);
    });
  });

  withListener('mouse_pressed', function() {
    it("should have some listeners", function() {
      expect(SPEC_CONTEXT.canvas.getEventListeners().length).toBeGreaterThan(0);
      expect(SPEC_CONTEXT.canvas.getEventListeners().length).toBeLessThan(6);
    });
  });

  withListener('mouse_clicked', function() {
    it("should have some listeners", function() {
      expect(SPEC_CONTEXT.canvas.getEventListeners().length).toBeGreaterThan(0);
      expect(SPEC_CONTEXT.canvas.getEventListeners().length).toBeLessThan(6);
    });
  });

  withListener('mouse_moved', function() {
    it("should have some listeners", function() {
      expect(SPEC_CONTEXT.canvas.getEventListeners().length).toBeGreaterThan(0);
      expect(SPEC_CONTEXT.canvas.getEventListeners().length).toBeLessThan(6);
    });
  });

  withListener('mouse_dragged', function() {
    it("should have some listeners", function() {
      expect(SPEC_CONTEXT.canvas.getEventListeners().length).toBeGreaterThan(0);
      expect(SPEC_CONTEXT.canvas.getEventListeners().length).toBeLessThan(6);
    });
  });
});
