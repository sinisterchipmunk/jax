Jax.EVENT_METHODS = (function() {
  function getCumulativeOffset(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);

    var result = [valueL, valueT];
    result.left = valueL;
    result.top = valueT;
    return result;
  }

  function buildKeyEvent(self, evt) {
    var keyboard = self.keyboard;

    evt = evt || window.event || {};
    evt.context = self;
    evt.canvas = self.canvas;
    keyboard.last = evt;

    /*
    TODO track all keypresses and whatnot via @keyboard, so all keys can be queried at any given time
     */

    return evt;
  }

  function buildMouseEvent(self, evt) {
    var mouse = self.mouse;

    evt = evt || window.event || {};
    evt.context = self;
    evt.canvas = self.canvas;
    evt.offsetx = mouse.x;
    evt.offsety = mouse.y;
    evt.mouse = mouse;
    
    mouse.offsetx = evt.offsetx || 0;
    mouse.offsety = evt.offsety || 0;

    var cumulativeOffset = getCumulativeOffset(self.canvas);
    mouse.x = evt.clientX - cumulativeOffset[0];
    mouse.y = evt.clientY - cumulativeOffset[1];
    mouse.y = self.canvas.height - mouse.y; // invert y

    // add scroll offsets
    if (window.pageXOffset) {
      mouse.x += window.pageXOffset;
      mouse.y += window.pageYOffset;
    } else {
      mouse.x += document.body.scrollLeft;
      mouse.y += document.body.scrollTop;
    }

    // calculate differences, useful for checking movement relative to last position
    mouse.diffx = mouse.x - mouse.offsetx;
    mouse.diffy = mouse.y - mouse.offsety;

    // check for button presses
    if (evt.type == "mousedown" || evt.type == "onmousedown") {
      mouse.down = mouse.down || {count:0};
      mouse.down["button"+evt.which] = {at:[mouse.x,mouse.y]};
    } else if (evt.type == "mouseup" || evt.type == "onmouseup") {
      if (mouse.down)
      {
        mouse.down.count--;
        if (mouse.down.count <= 0) mouse.down = null;
      }
    }

    return evt;
  }

  function dispatchEvent(self, evt) {
    var type = evt.type.toString();
    if (type.indexOf("on") == 0) type = type.substring(2, type.length);
    type = type.toLowerCase();
    var target;
    switch(type) {
      case "click":     target = "mouse_clicked"; break;
      case "mousemove":
        if (evt.move_type == 'mousemove') target = "mouse_moved";
        else                              target = "mouse_dragged";
        break;
      case "mousedown": target = "mouse_pressed"; break;
      case "mouseout":  target = "mouse_exited";  break;
      case "mouseover": target = "mouse_entered"; break;
      case "mouseup":   target = "mouse_released";break;
      case "keydown":   target = "key_down";      break;
      case "keypress":  target = "key_pressed";   break;
      case "keyup":     target = "key_released";  break;
      default: return true; // don't dispatch this event to the controller
    }
    if (self.current_controller[target])
    {
      var result = self.current_controller[target](evt);
      if (typeof(result) != "undefined") return result;
    }
    return true;
  }

  return {
    setupEventListeners: function() {
      this.keyboard = {};
      this.mouse = {};

      var canvas = this.canvas;
      var self = this;

      var mousefunc     = function(evt) {
        if (!self.current_controller) return;
        evt = buildMouseEvent(self, evt);
        return dispatchEvent(self, evt);
      };
      var mousemovefunc = function(evt) {
        if (!self.current_controller) return;
        evt = buildMouseEvent(self, evt);
        if (self.mouse && self.mouse.down == null) // mouse is not being dragged
          evt.move_type = "mousemove";
        else
          evt.move_type = "mousedrag";
        return dispatchEvent(self, evt);
      };
      var keyfunc       = function(evt) {
        if (!self.current_controller) return;
        evt = buildKeyEvent(self, evt);
        return dispatchEvent(self, evt);
      };

      if (canvas.addEventListener) {
        /* W3 */
        canvas.addEventListener('click',     mousefunc,     false);
        canvas.addEventListener('mousedown', mousefunc,     false);
        canvas.addEventListener('mousemove', mousemovefunc, false);
        canvas.addEventListener('mouseout',  mousefunc,     false);
        canvas.addEventListener('mouseover', mousefunc,     false);
        canvas.addEventListener('mouseup',   mousefunc,     false);
        canvas.addEventListener('keydown',   keyfunc,       false);
        canvas.addEventListener('keypress',  keyfunc,       false);
        canvas.addEventListener('keyup',     keyfunc,       false);
      } else {
        /* IE */
        canvas.attachEvent('onclick',     mousefunc    );
        canvas.attachEvent('onmousedown', mousefunc    );
        canvas.attachEvent('onmousemove', mousemovefunc);
        canvas.attachEvent('onmouseout',  mousefunc    );
        canvas.attachEvent('onmouseover', mousefunc    );
        canvas.attachEvent('onmouseup',   mousefunc    );
        canvas.attachEvent('onkeydown',   keyfunc      );
        canvas.attachEvent('onkeypress',  keyfunc      );
        canvas.attachEvent('onkeyup',     keyfunc      );
      }
    }
  };
})();