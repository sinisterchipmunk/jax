# Implements expanding/collapsing functionality for menu systems. You should # set `this.stateKey` property during initialize, which is used for 
# persistence. You should also call `@restoreState` after initialize.
#
class Jax.Dev.Views.Drawer extends Backbone.View
  collapseIcon: "collapse-small"
  expandIcon:   "expand-small"
  iconSelector: "a .icon"
  collapsedHeight: '24px'
  collapsedWidth: 'auto'

  @scrub: ->
    keys = $.cookie('__jax_drawer_state_keys')
    if keys
      for key in keys.split(',')
        $.removeCookie key
    $.removeCookie '__jax_drawer_state_keys'

  toggle: (e) =>
    if @collapsed
      @expand e
    else
      @collapse e

  # update layout to accommodate resizing child views. This method must
  # be invoked explicitly, but all instances of Drawer will emit a 'layout'
  # event when expanded or collapsed.
  layout: =>
    @$el.css 'width', 'auto'
    @$el.css 'height', 'auto'
    # if current height is clamped by max-height property, assign height
    # explicitly to a pixel value. This is necessary so that children can
    # use percentage-based heights as appropriate.
    if max = @$el.css 'max-height'
      cur = @$el.height()
      @$el.css 'height', max
      maxpx = @$el.height()
      if cur >= maxpx
        @$el.height maxpx
      else
        @$el.css 'height', 'auto'

  expand: (e) =>
    e?.preventDefault()
    e?.stopPropagation()
    if @collapseIcon
      @$(@iconSelector).removeClass @expandIcon
      @$(@iconSelector).addClass @collapseIcon
    @beforeExpand()
    curHeight = @$el.height()
    curWidth = @$el.width()
    @$el.css('width', 'auto').css('height', 'auto')
    targetWidth = @$el.width()
    targetHeight = @$el.height()
    @$el.css 'height', "#{curHeight}px"
    @$el.css 'width', "#{curWidth}px"
    # if item is not in DOM then we can't know its correct size, therefore
    # its size will animate to 0x0. Set its size to auto so that it can size
    # itself appropriately after adding to the dom.
    @setAutoAfterAnimation = !jQuery.contains document.documentElement, @el
    @$el.animate {
      'height': targetHeight
      'width': targetWidth
    }, 'fast', @afterExpand
    @collapsed = false
    @saveState()

  collapse: (e) =>
    e?.preventDefault()
    e?.stopPropagation()
    @beforeCollapse()
    if @expandIcon
      @$(@iconSelector).removeClass @collapseIcon
      @$(@iconSelector).addClass @expandIcon
    @$el.animate {
      'height': @collapsedHeight
      'width': @collapsedWidth
    }, 'fast', @afterCollapse
    @collapsed = true
    @saveState()

  beforeExpand: =>

  afterExpand: =>
    if @setAutoAfterAnimation
      @$el.css 'width', 'auto'
      @$el.css 'height', 'auto'
      # if the node is in the dom by now, assign it explicit dimensions
      if jQuery.contains document.documentElement, @el
        if @$el.width() and @$el.height()
          @$el.css 'width', @$el.width()
          @$el.css 'height', @$el.height()
    @trigger 'layout'

  beforeCollapse: =>

  afterCollapse: =>
    @trigger 'layout'

  isCollapsed: -> @collapsed
  isExpanded: -> !@collapsed

  saveState: =>
    throw new Error "add `@stateKey` to class" unless @stateKey
    keys = $.cookie('__jax_drawer_state_keys')
    if keys
      keys = keys.split(',')
      keys.push(@stateKey)
    else keys = [@stateKey]
    $.cookie '__jax_drawer_state_keys', keys.join(',')
    $.cookie @stateKey, "#{@collapsed}", expires: 365

  restoreState: =>
    throw new Error "add `@stateKey` to class" unless @stateKey
    if $.cookie(@stateKey) is 'true'
      @collapse()
    else
      @expand()

