window.debugAssert = function(expr, msg) {
  if (Jax.environment != "production" && !expr) throw new Error(msg || "debugAssert failed");
};

Math.EPSILON = Math.EPSILON || 0.00001;

/**
 * Jax
 * Root namespace containing all Jax data
 **/
var Jax = { };

//= require "jax/anim_frame"
//= require "jax/prototype/extensions"
//= require "jax/view_helper"
//= require "jax/model"
//= require "jax/controller"
//= require "jax/view_manager"
//= require "jax/route_set"
//= require "jax/view"
//= require "jax/context"

/**
 * Jax.shader_program_builders -> Object
 * 
 * This is a generic object. Each property of the object represents a shading technique, such
 * as 'phong' or 'blinn'. The value of each property is a function which is invoked when building
 * a shader. This function receives an "options" argument and is expected to return a generic
 * object containing several properties:
 *   * *vertex_source* : this is either a string or an array of strings representing the source
 *     code of the complete vertex shader. Arrays will be joined together with newline characters.
 *   * *fragment_source* : this is either a string or an array of strings representing the source
 *     code of the complete fragment shader. Arrays will be joined together with newline characters.
 *   * *uniforms* : this is a generic object containing properties whose names are the names of
 *     uniforms defined by the shader. Values of these properties are functions which return the
 *     buffer to be used for the uniform value. These functions receive the current Jax context as
 *     an argument.
 *   * *attributes* : this is a generic object containing properties whose names are the names of
 *     attributes defined by the shader. Values of these properties are functions which return the
 *     value to be used for the attribute value. These functions receive the current mesh being
 *     rendered as an argument.
 *     
 * This data will be compiled into a shader program.
 * 
 * Example:
 * 
 *     var sources = Jax.shader_program_builders['phong'](material_options);
 *     // => { vertex_source: '...', fragment_source: '...', uniforms: { ... }, attributes: { ... } }
 *     
 * The shader program builders are invoked from Jax.Shader, which is in turn invoked from
 * Jax.Material. So, by creating a material, you are invoking these functions. That means
 * you can add your own custom shader builders, and then invoke them very easily.
 * 
 * Example:
 * 
 *     Jax.shader_program_builders['custom'] = function(options) {
 *       // ...
 *       return { vertex_source: ['...'],
 *                fragment_source: ['...'],
 *                uniforms: {
 *                  mvMatrix: function(context) { return context.getModelViewMatrix(); }
 *                  pMatrix:  function(context) { return context.getProjectionMatrix(); }
 *                },
 *                attributes: {
 *                  vertices: function(object) { return object.getVertexBuffer(); },
 *                  colors:   function(object) { return object.getColorBuffer(); }
 *                }
 *              };
 *     }
 *     
 *     var customMaterial = new Jax.Material({ shaderType: 'custom' });
 **/
Jax.shader_program_builders = {};

/**
 * Jax.views -> Jax.ViewManager
 **/
Jax.views = new Jax.ViewManager();

/**
 * Jax.routes -> Jax.RouteSet
 **/
Jax.routes = new Jax.RouteSet();

/**
 * Jax.loaded -> Boolean
 * True after Jax has been loaded.
 **/
Jax.loaded = true;

/**
 * Jax.render_speed -> Number
 * Target number of milliseconds to wait between frames.
 * This is not a guaranteed number in JavaScript, just a target. Most notably,
 * system performance issues can drive the framerate down regardless of the
 * target refresh rate.
 **/
Jax.render_speed = 15;

Jax.max_lights = 32;

//= require "jax/builtin/all.js"
