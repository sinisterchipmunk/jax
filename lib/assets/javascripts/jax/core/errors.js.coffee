class JaxError extends Error
  constructor: () ->
    err = new Error()
    @name = err.name = this.__proto__.constructor.name
    if err.stack then @stack = err.stack

Jax.Error = JaxError
