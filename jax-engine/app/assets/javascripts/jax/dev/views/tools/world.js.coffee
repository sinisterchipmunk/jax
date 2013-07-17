class Jax.Dev.Views.Tools.World extends Backbone.View
  template: JST['jax/dev/tools/world']

  id: "world"

  events:
    "click #toggle-rendering": 'toggleRendering'
    "click #toggle-updating" : 'toggleUpdating'
    "click #draw-frame"      : "renderFrame"
    "click #tick"            : "updateFrame"

  initialize: ->
    @jax = @options.context
    @render()

  renderFrame: =>
    @jax.render()

  updateFrame: =>
    seconds = parseFloat @$("#tick-seconds").val()
    if isNaN seconds
      alert "Specified number of seconds to have elapsed is NaN"
    else if isFinite seconds
      @jax.update seconds
    else
      alert "Specified number of seconds is infinite"

  toggleRendering: =>
    if @jax.isRendering()
      @jax.stopRendering()
      @$("#toggle-rendering").removeClass 'stop-rendering'
      @$("#toggle-rendering").addClass 'start-rendering'
      @$("#toggle-rendering").val 'Resume Rendering'
      @trigger 'layout'
      @$("#draw-frame").prop 'disabled', false
    else
      @jax.startRendering()
      @$("#toggle-rendering").removeClass 'start-rendering'
      @$("#toggle-rendering").addClass 'stop-rendering'
      @$("#toggle-rendering").val 'Pause Rendering'
      @$("#draw-frame").prop 'disabled', true
      @trigger 'layout'

  toggleUpdating: =>
    if @jax.isUpdating()
      @jax.stopUpdating()
      @$("#toggle-updating").removeClass 'stop-updating'
      @$("#toggle-updating").addClass 'start-updating'
      @$("#toggle-updating").val 'Resume Updating'
      @$("#tick").prop 'disabled', false
      @$("#tick-seconds").prop 'disabled', false
      @trigger 'layout'
    else
      @jax.startUpdating()
      @$("#toggle-updating").removeClass 'start-updating'
      @$("#toggle-updating").addClass 'stop-updating'
      @$("#toggle-updating").val 'Pause Updating'
      @$("#tick").prop 'disabled', true
      @$("#tick-seconds").prop 'disabled', true
      @trigger 'layout'

  render: =>
    @$el.html @template()
    new Jax.Dev.Views.ColorPicker
      el: @$("#ambient-color")[0]
      label: "Ambient Color"
      color: @jax.world.ambientColor
