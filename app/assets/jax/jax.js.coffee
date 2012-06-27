# Pull in Jax.Context, which is the fundamental interface
# for using Jax.
#= require "jax/context"

# Load renderers. Jax will try to use renderers in the order they
# appear here.
#= require "jax/renderers/webgl"

# Support for input devices. Don't bother loading this
# if your scene does not process input from the user,
# or if you're handling that yourself.
#= require "jax/input"

# Perlin noise support
#= require "jax/noise"

# Support for built-in models and mesh types
#= require "jax/builtin/meshes/cube"
#= require "jax/builtin/meshes/line_cube"
#= require "jax/builtin/meshes/plane"
#= require "jax/builtin/meshes/ply"
#= require "jax/builtin/meshes/quad"
#= require "jax/builtin/meshes/sphere"
#= require "jax/builtin/meshes/teapot"
#= require "jax/builtin/meshes/torus"
#= require "jax/builtin/models/framerate"

# Support for Jax shaders and materials
# Without these, you'll need to manually pass a `material`
# object into the render sequence.
#= require "jax/shader"
#= require "jax/material"

# The default Jax scene manager. Without it, you'll need
# to manage the scene directly.
#= require "jax/world"

# Light and shadow constructs. Without these, you'll be unable
# to make use of the default diffuse, specular and shadow map
# shaders.
#= require "jax/light"
#= require "jax/shadow_map"

# TODO require these files from elsewhere so these lines can
# be removed
#= require "jax/webgl/core"
#= require "jax/camera"

# Your own files. If you remove this line, you'll have Jax
# but no Jax application.
#= require_tree '.'

# Pull in all shaders and resources.
#= require 'jax/shaders_and_resources'

# Deprecation warnings. These should come _last_ in the load order.
#= require 'jax/deprecation'
