describe("Jax.Controller", function() {
  var klass;
  var instance;
  
  describe("with an update method", function() {
    var context;
    
    beforeEach(function() {
      klass = Jax.Controller.create("welcome", { index: function() { }, update: function(tc) { } });
      Jax.views.push("welcome/index", function() { });
      Jax.routes.map("welcome", klass);
      context = new Jax.Context(document.getElementById('canvas-element'));
      instance = context.redirectTo("welcome");
      spyOn(instance, 'update');
    });
    
    it("should be called when the context is updated", function() {
      /*
        we can't really register a callback to setTimeout and check that it was called automatically,
        so we'll have to simulate it by calling Context#update() directly.
       */
      context.update();
      expect(instance.update).toHaveBeenCalled();
    });
  });

  describe("which does not render or redirect", function() {
    beforeEach(function() {
      klass = Jax.Controller.create("welcome", { index: function() { } });
      instance = new klass();
    });
    
    it("should produce the view named after the controller and action names", function() {
      instance.fireAction("index");
      expect(instance.view_key).toEqual("welcome/index");
    });
    
    it("should map the route automatically", function() {
      expect(function() { Jax.routes.recognize_route("welcome/index") }).not.toThrow();
    });
  });

  describe("with event actions", function() {
    var evt;

    function doMouseEvent(type) {
      /* MouseEvents - click, mousedown, mousemove, mouseout, mouseover, mouseup */
      /* initMouseEvent - type, bubbles, cancelable, windowObject, detail, screenX, screenY, clientX, clientY, ctrlKey,
       * altKey, shiftKey, metaKey, button, relatedTarget */
      evt = document.createEvent('MouseEvents');
      evt.initMouseEvent(type, true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
      document.getElementById('canvas-element').dispatchEvent(evt);
    }

    function doKeyEvent(type) {
      /* UIEvents - DOMActivate, DOMFocusIn, DOMFocusOut */
      /* KeyEvents / UIEvents - keydown, keypress, keyup */
      /* initUIEvent - type, bubbles, cancelable windowObject, detail */
      if (window.KeyEvent && !KeyEvent.fake) {
        evt = document.createEvent('KeyEvents');
        // type, bubbles, cancelable, windowObject, ctrlKey, altKey, shiftKey, metaKey, keyCode, charCode
        evt.initKeyEvent(type, true, true, window, false, false, false, false, 13, 0);
      } else {
        evt = document.createEvent('UIEvents');
        evt.initUIEvent(type, true, true, window, 1);
        evt.keyCode = 13;
      }
      document.getElementById('canvas-element').dispatchEvent(evt);
    }

    var context;

    beforeEach(function() {
      var methods = {
        mouse_clicked:  function(evt) { },
        mouse_moved:    function(evt) { },
        mouse_dragged:  function(evt) { },
        mouse_pressed:  function(evt) { },
        mouse_exited:   function(evt) { },
        mouse_entered:  function(evt) { },
        mouse_released: function(evt) { },
        key_typed:      function(evt) { },
        key_pressed:    function(evt) { },
        key_released:   function(evt) { }
      };
      klass.addMethods(methods);
      expect(instance).toHaveMethod("mouse_clicked"); // verify methods were added
      for (var method_name in methods) spyOn(instance, method_name);
      Jax.routes.clear();
      context = new Jax.Context(document.getElementById("canvas-element"));
      context.current_controller = instance;
    });
    afterEach(function() { context.dispose(); });

    it("should dispatch key pressed events", function() {
      doKeyEvent('keypress');
      expect(instance.key_typed).toHaveBeenCalled();
    });

    it("should dispatch key released events", function() {
      doKeyEvent('keyup');
      expect(instance.key_released).toHaveBeenCalled();
    });

    it("should dispatch key down events", function() {
      doKeyEvent('keydown');
      expect(instance.key_pressed).toHaveBeenCalled();
    });

    it("should dispatch mouse released events", function() {
      doMouseEvent('mouseup');
      expect(instance.mouse_released).toHaveBeenCalled();
    });
    it("should dispatch mouse entered events", function() {
      doMouseEvent('mouseout');
      expect(instance.mouse_exited).toHaveBeenCalled();
    });
    it("should dispatch mouse exited events", function() {
      doMouseEvent('mouseover');
      expect(instance.mouse_entered).toHaveBeenCalled();
    });

    it("should dispatch mouse pressed events", function() {
      doMouseEvent('mousedown');
      expect(instance.mouse_pressed).toHaveBeenCalled();
    });

    it("should dispatch mouse dragged events", function() {
      doMouseEvent('mousedown');
      doMouseEvent('mousemove');
      doMouseEvent('mouseup');
      expect(instance.mouse_dragged).toHaveBeenCalled();
    });

    it("should dispatch mouse moved events", function() {
      doMouseEvent('mousemove');
      expect(instance.mouse_moved).toHaveBeenCalled();
    });

    it("should dispatch mouse clicked events", function() {
      doMouseEvent('click');
      expect(instance.mouse_clicked).toHaveBeenCalled();
    });
  });
});
