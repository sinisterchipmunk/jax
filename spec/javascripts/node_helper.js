// This file's name matches the regexp used to load Jasmine helpers,
// so we need to code a special case to avoid causing errors.

if (typeof(require) != 'undefined') {
  var jsdom = require('jsdom'),
      doc   = jsdom.jsdom('<html><body></body></html>');
    
  global.document = doc;
  global.window = doc.createWindow();

  global.ENV = global.ENV || process.env;
  global.ENV['SILENCED'] = '1';

  /* TODO remove this when node-canvas supports webgl */
  var canvas = document._elementBuilders.canvas;
  document._elementBuilders.canvas = function(document, tagName) {
    var element = canvas.call(this, document, tagName);
    var getContext = element.getContext;
  
    element.getContext = function(name) {
      if (name == "webgl" || name == "experimental-webgl") {
        return require("./node/mocks/webgl.js").context();
      } else {
        return getContext.call(this, name);
      }
    };
  
    element.width = element.height = 100;
  
    return element;
  };

  // mock navigator
  global.navigator = {
    userAgent: 'firefox'
  };

  global.Image = global.Image || function() {
    var src;
  
    this.__defineGetter__("src", function() {
      return src;
    });
  
    this.__defineSetter__("src", function(s) {
      src = s;
      if (this.onload) this.onload();
      return src;
    });
  };

  global.Jax = require("../../tmp/jax.js").Jax;

  require("./helpers/jax_spec_environment_helper.js");
  setupJaxSpecContext();
} // if (typeof(require) != 'undefined')
