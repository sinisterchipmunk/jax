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
  
  describe("controller mouse events", function() {
    var controller, evt;
    beforeEach(function() {
      controller = Jax.Controller.create('test', { index: function() { } });
      Jax.views.push('test/index', function() { });
      // Jax.routes.map('test/index', controller, 'index');
    });
    
    function sendMouseEvent(type, x, y) {
      evt = document.createEvent('MouseEvents');
      evt.initMouseEvent(type, true, true, Jax.getGlobal(), 1, x, y, x, y, false, false, false, false, 0, null);
      SPEC_CONTEXT.canvas.dispatchEvent(evt);
    }
    
    describe("with a scaled canvas", function() {
      beforeEach(function() {
        SPEC_CONTEXT.canvas.offsetWidth  = SPEC_CONTEXT.canvas.width*2;
        SPEC_CONTEXT.canvas.offsetHeight = SPEC_CONTEXT.canvas.height*2;
      });

      it("should translate event to real dimensions", function() {
        if (SPEC_CONTEXT.canvas.offsetWidth) {
          var evt;
          controller.prototype.mouse_moved = function(e) { evt = e; };
          SPEC_CONTEXT.redirectTo('test');
          sendMouseEvent("mousemove", SPEC_CONTEXT.canvas.width, SPEC_CONTEXT.canvas.height);
          expect(evt.x).toEqual(SPEC_CONTEXT.canvas.width/2);
          expect(evt.y).toEqual(SPEC_CONTEXT.canvas.height/2);
        }
      });
    });

    
    describe("mouse exit canvas (mouseout)", function() {
      var dragged;
      beforeEach(function() {
        dragged = false;
        controller.prototype.mouse_dragged = function() { dragged = true; };
        SPEC_CONTEXT.redirectTo('test');
      });
      
      it("should not continue dragging", function() {
        // simulate mouse down, then drag, then exit
        sendMouseEvent('mousedown');
        sendMouseEvent('mousemove');
        sendMouseEvent('mouseout');
        // reset +dragged+ so we can track the next result
        dragged = false;
        // bring mouse back in
        sendMouseEvent('mouseover');
        sendMouseEvent('mousemove');
        
        expect(dragged).toBeFalsy();
      });
    });

    describe("mouse move", function() {
      var dragged;
      beforeEach(function() {
        dragged = false;
        controller.prototype.mouse_dragged = function() { dragged = true; };
        SPEC_CONTEXT.redirectTo('test');
      });
      
      it("should not be dragged after clicking", function() {
        // simulate a click
        sendMouseEvent('mousedown');
        sendMouseEvent('mouseup');
        sendMouseEvent('click');
        // move the mouse
        sendMouseEvent('mousemove');
        
        expect(dragged).toBeFalsy();
      });
    });

    describe("mouse click", function() {
      var clicked;

      beforeEach(function() {
        clicked = false;
        controller.prototype.mouse_clicked = function() { clicked = true; };
        SPEC_CONTEXT.redirectTo('test');
        sendMouseEvent('mousedown');
        expect(Jax.click_speed).toBeGreaterThan(0); // sanity check
      });

      it("should not be interfered with by mouse movement", function() {
        Jax.uptime += Jax.click_speed / 2 + 1;
        sendMouseEvent('mousemove');
        Jax.uptime += Jax.click_speed / 2 + 1;
        sendMouseEvent('click');
        expect(clicked).toBeFalsy();
      });

      it("should not fire if too much time elapses between down and up", function() {
        Jax.uptime += Jax.click_speed+1;
        sendMouseEvent('click');
        expect(clicked).toBeFalsy();
      });

      it("should carry through if time elapsed < click_speed", function() {
        Jax.uptime += Jax.click_speed-1;
        sendMouseEvent('click');
        expect(clicked).toBeTruthy();
      });

      it("should carry through if click_speed is nil", function() {
        var speed = Jax.click_speed;
        Jax.click_speed = null;
        sendMouseEvent('click');
        expect(clicked).toBeTruthy();
        Jax.click_speed = speed;
      });
    });
  });

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
