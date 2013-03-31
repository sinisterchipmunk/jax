class Jax.Dev.Views.Tools.World extends Backbone.View
  template: JST['jax/dev/tools/world']

  events:
    "click #toggle-rendering": 'toggleRendering'
    "click #toggle-updating":  'toggleUpdating'

  initialize: ->
    @jax = @options.context
    @render()

  toggleRendering: =>
    if @jax.isRendering()
      @jax.stopRendering()
      @$("#toggle-rendering").removeClass 'stop-rendering'
      @$("#toggle-rendering").addClass 'start-rendering'
      @$("#toggle-rendering").val 'Resume Rendering'
      @trigger 'layout'
    else
      @jax.startRendering()
      @$("#toggle-rendering").removeClass 'start-rendering'
      @$("#toggle-rendering").addClass 'stop-rendering'
      @$("#toggle-rendering").val 'Pause Rendering'
      @trigger 'layout'

  toggleUpdating: =>
    if @jax.isUpdating()
      @jax.stopUpdating()
      @$("#toggle-updating").removeClass 'stop-updating'
      @$("#toggle-updating").addClass 'start-updating'
      @$("#toggle-updating").val 'Resume Updating'
      @trigger 'layout'
    else
      @jax.startUpdating()
      @$("#toggle-updating").removeClass 'start-updating'
      @$("#toggle-updating").addClass 'stop-updating'
      @$("#toggle-updating").val 'Pause Updating'
      @trigger 'layout'

  render: =>
    @$el.html @template()
    new Jax.Dev.Views.ColorPicker
      el: @$("#ambient-color")[0]
      label: "Ambient Color"
      color: @jax.world.ambientColor
