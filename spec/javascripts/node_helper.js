require.paths.unshift(".", "./spec/javascripts");

// this has to happen first because jasmine checks for a 'window', which node_dom_emulator
// creates for the Jax/node compatibility layer
var jasmineGlobals = require('../../vendor/jasmine/lib/jasmine.js');
for (var k in jasmineGlobals)
  global[k] = jasmineGlobals[k];

// set up Jax node helpers
global.document = require("node/mocks/dom.js").document;

// pull in Jax
var g = require("../../dist/jax.js");
for (var i in g) global[i] = g[i];
global.alert = console.log;

Jax.Context.prototype.toJSON = Jax.Context.prototype.toString = function() { return "Jax.Context({...})"; };
Jax.World.prototype.toJSON = Jax.World.prototype.toString = function() { return "Jax.World({...})"; };
Jax.Mesh.prototype.toJSON = Jax.Mesh.prototype.toString = function() { return "Jax.Mesh({...})"; };
Jax.Model.prototype.toJSON = Jax.Model.prototype.toString = function() { return "Jax.Model({...})"; };

// load shaders (generated at ruby level)
require("../../tmp/shaders.js");

// setup Jasmine node helpers
var fs = require('fs');
var sys = require('sys');
var path = require('path');

// yes, really keep this here to keep us honest, but only for jasmine's own runner! [xw]
// undefined = "diz be undefined yo";


require('../../vendor/jasmine/src/console/TrivialConsoleReporter.js');

/*
 Pulling in code from jasmine-node.

 We can't just depend on jasmine-node because it has its own jasmine that it uses.
 */

global.window = {
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval
};

delete global.window;

function noop() {
}

jasmine.executeSpecs = function(specs, done) {
  for (var i = 0, len = specs.length; i < len; ++i) {
    var filename = specs[i];
    require(filename.replace(/\.\w+$/, ""));
  }

  var jasmineEnv = jasmine.getEnv();
  var consoleReporter = new jasmine.TrivialConsoleReporter(sys.print, done);

  jasmineEnv.addReporter(consoleReporter);
  jasmineEnv.execute();
};

jasmine.getAllSpecFiles = function(dir, matcher) {
  var specs = [];

  if (fs.statSync(dir).isFile() && dir.match(matcher)) {
    specs.push(dir);
  } else {
    var files = fs.readdirSync(dir);
    for (var i = 0, len = files.length; i < len; ++i) {
      var filename = dir + '/' + files[i];
      if (fs.statSync(filename).isFile() && filename.match(matcher)) {
        specs.push(filename);
      } else if (fs.statSync(filename).isDirectory()) {
        var subfiles = this.getAllSpecFiles(filename, matcher);
        subfiles.forEach(function(result) {
          specs.push(result);
        });
      }
    }
  }

  return specs;
};

function now() {
  return new Date().getTime();
}

jasmine.asyncSpecWait = function() {
  var wait = jasmine.asyncSpecWait;
  wait.start = now();
  wait.done = false;
  (function innerWait() {
    waits(10);
    runs(function() {
      if (wait.start + wait.timeout < now()) {
        expect('timeout waiting for spec').toBeNull();
      } else if (wait.done) {
        wait.done = false;
      } else {
        innerWait();
      }
    });
  })();
};
jasmine.asyncSpecWait.timeout = 4 * 1000;
jasmine.asyncSpecDone = function() {
  jasmine.asyncSpecWait.done = true;
};

for (var key in jasmine) {
  exports[key] = jasmine[key];
}

/*
 End jasmine-node runner
 */

var isVerbose = false;
var showColors = true;
process.argv.forEach(function(arg) {
  switch (arg) {
    case '--color': showColors = true; break;
    case '--noColor': showColors = false; break;
    case '--verbose': isVerbose = true; break;
  }
});
var specs = jasmine.getAllSpecFiles(__dirname, new RegExp("_spec.js$"));

var helpers = jasmine.getAllSpecFiles(__dirname, new RegExp("_helper.js$"));
for (var i = 0; i < helpers.length; i++) {
  // need to grab the 'glit' function, which is used to auto-disable specs that rely
  // on a *real* implementation of webgl. See ./helpers/jasmine_webgl_helper.js
  var s = require(helpers[i]);
  if (s.glit) global.glit = s.glit;
}

setupJaxSpecContext();

jasmine.executeSpecs(specs, function(runner, log) {
  Jax.shutdown();

  if (runner.results().failedCount === 0) {
   process.exit(0);
  } else {
   process.exit(1);
  }
}, isVerbose, showColors);
