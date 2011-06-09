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
    // we don't really need these since controllers have this.context
//    evt.context = self;
//    evt.canvas = self.canvas;
    keyboard.last = evt;

    /*
    TODO track all keypresses and whatnot via @keyboard, so all keys can be queried at any given time
     */

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
    mouse.y = self.canvas.height - mouse.y; // invert y

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
    
    evt.x = mouse.x;
    evt.y = mouse.y;
    evt.diffx = mouse.diffx;
    evt.diffy = mouse.diffy;
    evt.down = mouse.down;

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

  return {
    disposeEventListeners: function() {
      this.canvas.removeEventListener(this._evt_mousefunc);
      this.canvas.removeEventListener(this._evt_mousemovefunc);
      this.canvas.removeEventListener(this._evt_keyfunc);
      document.removeEventListener('keydown', this._evt_keyfunc);
      document.removeEventListener('keyup', this._evt_keyfunc);
      document.removeEventListener('keypress', this._evt_keyfunc);
      document.removeEventListener('onkeydown', this._evt_keyfunc);
      document.removeEventListener('onkeyup', this._evt_keyfunc);
      document.removeEventListener('onkeypress', this._evt_keyfunc);
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
        if (self.mouse && self.mouse.down == null) // mouse is not being dragged
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

      if (canvas.addEventListener) {
        /* W3 */
        canvas.addEventListener('click',     this._evt_mousefunc,     false);
        canvas.addEventListener('mousedown', this._evt_mousefunc,     false);
        canvas.addEventListener('mousemove', this._evt_mousemovefunc, false);
        canvas.addEventListener('mouseout',  this._evt_mousefunc,     false);
        canvas.addEventListener('mouseover', this._evt_mousefunc,     false);
        canvas.addEventListener('mouseup',   this._evt_mousefunc,     false);
        document.addEventListener('keydown',   this._evt_keyfunc,       false);
        document.addEventListener('keypress',  this._evt_keyfunc,       false);
        document.addEventListener('keyup',     this._evt_keyfunc,       false);
      } else {
        /* IE */
        canvas.attachEvent('onclick',     this._evt_mousefunc    );
        canvas.attachEvent('onmousedown', this._evt_mousefunc    );
        canvas.attachEvent('onmousemove', this._evt_mousemovefunc);
        canvas.attachEvent('onmouseout',  this._evt_mousefunc    );
        canvas.attachEvent('onmouseover', this._evt_mousefunc    );
        canvas.attachEvent('onmouseup',   this._evt_mousefunc    );
        document.attachEvent('onkeydown',   this._evt_keyfunc      );
        document.attachEvent('onkeypress',  this._evt_keyfunc      );
        document.attachEvent('onkeyup',     this._evt_keyfunc      );
      }
    }
  };
})();
