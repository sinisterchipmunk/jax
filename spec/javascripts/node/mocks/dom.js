var Events = require("events");

// Unit tests can cause more listeners to be registered than node is expecting (default max is 10).
// Raising the limit silences warnings.
var MAX_LISTENERS = 1024;

global.navigator = {
  userAgent: "node.js"
};

/*** Events ***/
var Event = {
  UIEvents: function() { },
  MouseEvents: function() { }
};

Event.UIEvents.prototype.initUIEvent = function(type) { this.type = type; };
Event.MouseEvents.prototype.initMouseEvent = function(type) { this.type = type; };


/*** Element ***/

function Element() {
  this.style = {};
  this.children = [];
  Events.EventEmitter.call(this);
  this.setMaxListeners(MAX_LISTENERS);
}
Element.super_ = Events.EventEmitter;
Element.prototype = Object.create(Events.EventEmitter.prototype, {
  constructor: {
    value: Element,
    enumerable: false
  }
});

Element.extend = function(func) {
  for (var i in Element.prototype)
    func.prototype[i] = func.prototype[i] || Element.prototype[i];
  return func;
};

Element.prototype.dispatchEvent = function(evt) {
  if (evt.type.indexOf("key") != -1) {
    // dispatch key events at the document level
    document.emit(evt.type, evt);
  } else {
    // dispatch mouse events at the element level (right?)
    this.emit(evt.type, evt);
  }
};

Element.prototype.setAttribute = function(key, value) { this[key] = value; };

Element.prototype.getAttribute = function(key) { return this[key]; };

Element.prototype.appendChild = function(ele) {
  this.children.push(ele);
};

Element.prototype.removeChild = function(ele) {
  var index = this.children.indexOf(ele);
  if (index != -1) this.children.splice(index, 1);
  return ele;
};

Element.prototype.recursivelyGetByTagName = function(name) {
  if (!name) throw new Error("Can't find tags without a name");
  
  var result = [];
  if (this.getAttribute("name").toLowerCase() == name.toLowerCase())
    result.push(this);
  for (var ch = 0; ch < this.children.length; ch++)
    result = result.concat(this.children[ch].recursivelyGetByTagName(name));
  return result;
};

Element.prototype.recursivelyFindFirstWithId = function(id) {
  if (!id) throw new Error("Can't find tag by id without an id!");
  if (this.getAttribute("id") == id) return this;
  var result;
  for (var ch = 0; ch < this.children.length; ch++)
    if (result = this.children[ch].recursivelyFindFirstWithId(id))
      return result;
  return null;
};

Element.prototype.addEventListener = function(name, callback, capture) {
  if (arguments.length != 3) throw new Error("Invalid argument count");
  this.on(name, callback);
};

Element.prototype.removeEventListener = function(name, callback, capture) {
  if (arguments.length != 3) throw new Error("Invalid argument count");
  this.removeListener(name, callback);
};

/*** Canvas ***/

Element.canvas = Element.extend(function() {
  Element.call(this);
});

Element.canvas.prototype.getContext = function(which) {
  return require("node/mocks/webgl.js").context();
};

var _Array = require("node/mocks/array.js").array;
global.Float32Array = _Array;
global.Uint8Array = _Array;
global.Uint16Array = _Array;

/*** Image ***/

global.Image = function() {
  var self = this;
  setTimeout(function() { if (self.onload) self.onload(this); }, 10);
};


/*** Document ***/

function Document() {
  this.body = this.createElement("body");
  this.location = { pathname: "/" };
  
  Events.EventEmitter.call(this);
  this.setMaxListeners(MAX_LISTENERS);
}

Document.super_ = Events.EventEmitter;
Document.prototype = Object.create(Events.EventEmitter.prototype, {
  constructor: {
    value: Document,
    enumerable: false
  }
});

Document.prototype.addEventListener = function(name, callback, capture) {
  if (arguments.length != 3) throw new Error("Invalid argument count");
  this.on(name, callback);
};

Document.prototype.removeEventListener = function(name, callback, capture) {
  if (arguments.length != 3) throw new Error("Invalid argument count");
  if (!callback) throw new Error("Callback is undefined");
  this.removeListener(name, callback);
};

Document.prototype.createElement = function(name) {
  if (!name) throw new Error("Can't create element without a name");
  
  var ele;
  if (Element[name]) ele = new Element[name]();
  else ele = new Element();
  ele.setAttribute('name', name);
  
  return ele;
}

Document.prototype.createEvent = function(type) {
  if (!Event[type])
    throw new Error("Event type not found: "+type);
  return new Event[type]();
};

Document.prototype.getElementsByTagName = function(name) {
  return document.body.recursivelyGetByTagName(name);
};

Document.prototype.getElementById = function(name) {
  return document.body.recursivelyFindFirstWithId(name);
};

var document = exports.document = new Document();

