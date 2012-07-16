Function::define = (prop, desc) ->
  Object.defineProperty this.prototype, prop, desc
  
Function::setter = (prop, setter) ->
  Object.defineProperty this.prototype, prop, set: setter
  
Function::getter = (prop, getter) ->
  Object.defineProperty this.prototype, prop, get: getter

Function::accessor = (prop, setter, getter) ->
  Object.defineProperty this.prototype, prop, get: getter, set: setter

Function::extend = (mixins...) ->
  for mixin in mixins
    for name, method of mixin
      this[name] = method unless this.hasOwnProperty(name)

Function::include = (mixins...) ->
  Function::extend.apply this.prototype, mixins
