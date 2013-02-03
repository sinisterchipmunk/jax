//= require jax/jasmine_helpers

var jsApiReporter;
(function() {
  jsApiReporter = new jasmine.JsApiReporter();
  jasmine.getEnv().addReporter(jsApiReporter);
})();
