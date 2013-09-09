#= require 'dev/jquery.cookie'
#= require 'dev/underscore'
#= require 'dev/backbone'
#= require 'dev/syntax'
#= require 'dev/syntax-js'
#= require 'jax/dev/templates'
#= require 'jax/dev'
#= require dev/colorpicker
#= require_self
#= require jax/dev/_paths
#= require_tree ./dev/mixins
#= require_tree ./dev

Jax.Dev or=
  Views: {}
  Models: {}
  Mixins: {}
  Collections: {}
  Templates: {}
  Paths: {}

$ ->
  unless window.router
    window.router = new Jax.Dev.Router
    Backbone.history.start()
