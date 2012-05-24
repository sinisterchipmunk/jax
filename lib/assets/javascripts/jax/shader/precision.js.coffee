class Jax.Shader.Precision
  constructor: ->
    @float =
      type: 'float'
      qualifier: 'mediump'
      priority: -1
  
  select_by_priority = (desc) ->
    if @[desc.type]
      if @[desc.type].priority < desc.priority
        @[desc.type] = desc
    else
      @[desc.type] = desc
  
  add: (desc) ->
    desc.priority = switch desc.qualifier
      when 'highp'   then 2
      when 'mediump' then 1
      when 'lowp'    then 0
      else throw new Error "Unexpected precision qualifier: #{desc.qualifier}"
      
    select_by_priority.call @, desc
   
  @define 'all', get: ->
    result = []
    for key, desc of this
      if typeof desc is 'object' and desc.type
        result.push desc
    result
    
  merge: (other) ->
    for desc in other.all
      select_by_priority.call @, desc
    @