lastTime = 0
vendors = ['ms', 'moz', 'webkit', 'o']

@cancelAnimationFrame or= @cancelRequestAnimationFrame

unless @requestAnimationFrame
  for vendor in vendors
    @requestAnimationFrame or= @[vendor+'RequestAnimationFrame']
    @cancelAnimationFrame = @cancelRequestAnimationFrame or= @[vendor+'CancelRequestAnimationFrame']
  
unless @requestAnimationFrame
  @requestAnimationFrame = (callback, element) ->
    currTime = new Date().getTime()
    timeToCall = Math.max 0, 16 - (currTime - lastTime)
    id = @setTimeout (-> callback currTime + timeToCall), timeToCall
    lastTime = currTime + timeToCall
    id

unless @cancelAnimationFrame
  @cancelAnimationFrame = @cancelRequestAnimationFrame = (id) -> clearTimeout id
