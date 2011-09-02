/**
 * Jax.EVENT_METHODS -> Object
 * Contains event handling methods which are added to +Jax.Context+.
 **/
Jax.EVENT_METHODS = (function() {
  function getCumulativeOffset(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      valueT += Jax.Compatibility.offsetTop;
      valueL += Jax.Compatibility.offsetLeft;
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
    keyboard.last = evt;
    return evt;
  }
  
  function fixEvent(event) {
    // this borrowed from jQuery
    // store a copy of the original event object
		// and "clone" to set read-only properties
		var originalEvent = event;
		event = {type:originalEvent.type};
		var props = "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" ");

		for ( var i = props.length, prop; i; ) {
			prop = props[ --i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Fix target property, if necessary
		if ( !event.target ) {
			// Fixes #1925 where srcElement might not be defined either
			event.target = event.srcElement || document;
		}

		// check if target is a textnode (safari)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Add relatedTarget, if necessary
		if ( !event.relatedTarget && event.fromElement ) {
			event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
		}

		// Calculate pageX/Y if missing and clientX/Y available
		if ( event.pageX == null && event.clientX != null ) {
			var eventDocument = event.target.ownerDocument || document,
				doc = eventDocument.documentElement,
				body = eventDocument.body;

			event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
			event.pageY = event.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
		}

		// Add which for key events
		if ( event.which == null && (event.charCode != null || event.keyCode != null) ) {
			event.which = event.charCode != null ? event.charCode : event.keyCode;
		}

		// Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
		if ( !event.metaKey && event.ctrlKey ) {
			event.metaKey = event.ctrlKey;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		// Note: button is not normalized, so don't use it
		if ( !event.which && event.button !== undefined ) {
			event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
		}

		return event;
  }

  function buildMouseEvent(self, evt) {
    var mouse = self.mouse;

    evt = fixEvent(evt || window.event);
    evt.context = self;
    evt.canvas = self.canvas;
    evt.offsetx = mouse.x;
    evt.offsety = mouse.y;
    evt.mouse = mouse;
    
    mouse.offsetx = evt.offsetx || 0;
    mouse.offsety = evt.offsety || 0;

    var cumulativeOffset = getCumulativeOffset(self.canvas);
    mouse.x = evt.pageX - cumulativeOffset[0];
    mouse.y = evt.pageY - cumulativeOffset[1];

    if (self.canvas) {
      if (self.canvas.offsetWidth)  mouse.x = mouse.x / self.canvas.offsetWidth  * self.canvas.width;
      if (self.canvas.offsetHeight) mouse.y = mouse.y / self.canvas.offsetHeight * self.canvas.height;
    }

    mouse.y = self.canvas.height - mouse.y; // invert y

    // calculate differences, useful for checking movement relative to last position
    if (evt.type == 'mouseover') {
      // don't count 'mouseover' or we'll inadvertently cancel out long movements
      mouse.diffx = mouse.diffy = 0;
    } else {
      mouse.diffx = mouse.x - mouse.offsetx;
      mouse.diffy = mouse.y - mouse.offsety;
    }
    
    // check button state special cases
    if (evt.type == "mousedown" || evt.type == "onmousedown") {
      // begin dragging, and possibly click
      mouse.down = mouse.down || {count:0};
      mouse.down["button"+evt.which] = {at:[mouse.x,mouse.y],time:Jax.uptime};
      mouse.down.count++;
    } else if (evt.type == "click" || evt.type == "onclick") {
      // complete click
      evt.cancel = false;
      if (mouse.down && mouse.down["button"+evt.which]) {
        evt.cancel = !!Jax.click_speed && (Jax.uptime - mouse.down["button"+evt.which].time) > Jax.click_speed;
      }
    } else if (evt.type == "mouseup" || evt.type == "onmouseup") {
      // stop dragging
      if (mouse.down)
      {
        mouse.down.count--;
        // mouse.down = null;
        if (mouse.down.count < 0) mouse.down.count = 0;
      }
    } else if (evt.type == "mouseout" || evt.type == "onmouseout") {
      // reset all mousedown state so when mouse re-enters we won't be dragging
      // in practice, this behavior is accurate more often than the opposite
      // (e.g. drag out and then back in without releasing).
      // Requiring an extra mouse-up in this opposite instance is harmless and
      // relatively unobtrusive.
      mouse.down = null;
    }
    
    evt.x = mouse.x;
    evt.y = mouse.y;
    evt.diffx = mouse.diffx;
    evt.diffy = mouse.diffy;
    evt.down = mouse.down;

    return evt;
  }

  function dispatchEvent(self, evt) {
    if (evt.cancel) return;
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
      case "keydown":   target = "key_pressed";   break;
      case "keypress":  target = "key_typed";     break;
      case "keyup":     target = "key_released";  break;
      default: return true; // don't dispatch this event to the controller
    }

    if (self.current_controller[target]) {
      var result = self.current_controller[target](evt);
      if (result != undefined) return result;
    }
    return true;
  }
  
  // Tag names which, when active, should cause key input to be IGNORED. The implication is that while
  // one of these tags has focus, the user doesn't want to be controlling his character because s/he is
  // trying to type something.
  var ignoreKeyTagNames = [
          'input', 'form', 'textarea', 'label', 'fieldset', 'legend', 'select', 'optgroup', 'option', 'button'
  ];

  function registerListener(self, type, func) {
    if (self.canvas.addEventListener) {
      /* W3 */
      self.canvas.addEventListener(type, func, false);
    } else {
      /* IE */
      self.canvas.attachEvent("on"+type, func);
    }
  }

  return {
    disposeEventListeners: function() {
      this.unregisterMouseListeners();
      this.unregisterKeyListeners();
    },
    
    registerMouseListeners: function(receiver) {
      // we have to watch over/out to avoid problematic 'jittering' on mousemove
      var register = {mouseover:1,mouseout:1}, name;
      for (name in receiver) {
        switch(name) {
          case 'mouse_pressed' : register['mousedown'] = 1; break;
          case 'mouse_released': register['mouseup'] = 1; break;
          case 'mouse_dragged' : // same as mouse_moved
          case 'mouse_moved'   : register['mousedown'] = register['mouseup'] = register['mousemove'] = 1; break;
          case 'mouse_clicked' : register['click'] = register['mousedown'] = 1; break;
          case 'mouse_exited'  : register['mouseout'] = 1; break;
          case 'mouse_entered' : register['mouseover'] = 1; break;
        };
      }
      
      for (name in register) {
        if (name == 'mousemove')
          registerListener(this, name, this._evt_mousemovefunc);
        else
          registerListener(this, name, this._evt_mousefunc);
      }
    },
    
    unregisterMouseListeners: function() {
      if (this._evt_mousefunc)     this.canvas.removeEventListener(this._evt_mousefunc);
      if (this._evt_mousemovefunc) this.canvas.removeEventListener(this._evt_mousemovefunc);
    },
    
    registerKeyListeners: function() {
      if (this.canvas.addEventListener) {
        /* W3 */
        document.addEventListener('keydown',   this._evt_keyfunc,       false);
        document.addEventListener('keypress',  this._evt_keyfunc,       false);
        document.addEventListener('keyup',     this._evt_keyfunc,       false);
      } else {
        /* IE */
        document.attachEvent('onkeydown',   this._evt_keyfunc);
        document.attachEvent('onkeypress',  this._evt_keyfunc);
        document.attachEvent('onkeyup',     this._evt_keyfunc);
      }
    },
    
    unregisterKeyListeners: function() {
      if (!this._evt_keyfunc) return;
      
      this.canvas.removeEventListener(this._evt_keyfunc);
      document.removeEventListener('keydown',    this._evt_keyfunc, false);
      document.removeEventListener('keyup',      this._evt_keyfunc, false);
      document.removeEventListener('keypress',   this._evt_keyfunc, false);
      document.removeEventListener('onkeydown',  this._evt_keyfunc, false);
      document.removeEventListener('onkeyup',    this._evt_keyfunc, false);
      document.removeEventListener('onkeypress', this._evt_keyfunc, false);
    },
        
    setupEventListeners: function() {
      this.keyboard = {};
      this.mouse = {};

      var canvas = this.canvas;
      var self = this;

      this._evt_mousefunc     = function(evt) {
        if (!self.current_controller) return;
        evt = buildMouseEvent(self, evt);
        return dispatchEvent(self, evt);
      };
      this._evt_mousemovefunc = function(evt) {
        if (!self.current_controller) return;
        evt = buildMouseEvent(self, evt);
        if (self.mouse && (!self.mouse.down || self.mouse.down.count <= 0)) // mouse is not being dragged
          evt.move_type = "mousemove";
        else
          evt.move_type = "mousedrag";
        return dispatchEvent(self, evt);
      };
      this._evt_keyfunc       = function(evt) {
        if (evt.which) evt.str = String.fromCharCode(evt.which);
        if (document.activeElement) {
          if (ignoreKeyTagNames.indexOf(document.activeElement.tagName) != -1)
          { // user is probably trying to type, so don't capture this input
            return;
          }
        }
        if (!self.current_controller) return;
        evt = buildKeyEvent(self, evt);
        return dispatchEvent(self, evt);
      };

      this.registerKeyListeners();
      
      // this is now done by the context
      // this.registerMouseListeners();
    }
  };
})();
