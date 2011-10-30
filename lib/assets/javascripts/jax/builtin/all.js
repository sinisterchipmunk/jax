/* meshes */
//= require "jax/builtin/meshes/quad"
//= require "jax/builtin/meshes/cube"
//= require "jax/builtin/meshes/torus"
//= require "jax/builtin/meshes/plane"
//= require "jax/builtin/meshes/sphere"
//= require "jax/builtin/meshes/teapot"

//= require "shaders/texture/material"
//= require "shaders/normal_map/material"
//= require "shaders/shadow_map/material"
//= require "shaders/depthmap/material"
//= require "shaders/paraboloid/material"
//= require "shaders/fog/material"
//= require "shaders/picking/material"

Jax.Material.create("basic");
Jax.Material.create("default", {default_shader:'basic'});
Jax.Material.create("depthmap", {default_shader:"depthmap"});
Jax.Material.create("paraboloid-depthmap", {type:"Paraboloid",default_shader:"paraboloid",layers:[{type:"Depthmap"}]});
Jax.Material.create("picking", {type:"Picking"});
