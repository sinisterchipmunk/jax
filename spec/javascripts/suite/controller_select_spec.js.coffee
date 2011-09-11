#= require "jquery"
#= require "jax/controller-select"

describe "The select box in the dev suite runtime", ->
  select = null
  
  beforeEach ->
    Jax.routes.clear()
    Jax.views.push 'welcome/index', -> 1
    Jax.routes.map "Welcome", Jax.Controller.create "Welcome",
      index: -> 1
    select = document.createElement("select")
    _controller_select_fill select
  
  it "should contain the 'Welcome' controller", ->
    expect(select.options[0].value).toEqual("welcome")

  describe "clicked", ->
    beforeEach ->
      select.webgl_context = SPEC_CONTEXT
      select.selectedIndex = 0
      $(select).trigger("change");
    
    it "should redirect to the selected controller", ->
      expect(SPEC_CONTEXT.current_controller.getControllerName()).toEqual("Welcome")
