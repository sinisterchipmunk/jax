Function::define = (prop, desc) ->
  Object.defineProperty this.prototype, prop, desc
