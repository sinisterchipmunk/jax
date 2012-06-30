Jax.Material.Texture = Jax.Class.create(Jax.Material.Layer, {
  initialize: function($super, options) {
    var texture;
    if (options instanceof Jax.Texture) texture = options;
    else if (options && options.instance) texture = options.instance;
    else texture = new Jax.Texture(options)
    
    this.texture = texture;
    this.dataMap = { textures: 'VERTEX_TEXCOORDS' };
    
    $super({shader:"texture"});
  },
  
  setVariables: function(context, mesh, model, vars, pass) {
    vars.TextureScaleX = this.texture.options.scale_x || this.texture.options.scale || 1;
    vars.TextureScaleY = this.texture.options.scale_y || this.texture.options.scale || 1;
    vars.Texture = this.texture;
    mesh.data.set(vars, this.dataMap);
  }
});
