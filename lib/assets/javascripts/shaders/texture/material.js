Jax.Material.Texture = Jax.Class.create(Jax.Material.Layer, {
  initialize: function($super, options, material) {
    var texture;
    if (options instanceof Jax.Texture) texture = options;
    else if (options && options.instance) texture = options.instance;
    else texture = new Jax.Texture(options)
    
    this.texture = texture;
    this._set_cache = {
      'Texture': texture
    };
    
    $super({shader:"texture"}, material);
  },
  
  setVariables: function(context, mesh, model, vars, pass) {
    this._set_cache.TextureScaleX = this.texture.options.scale_x || this.texture.options.scale || 1;
    this._set_cache.TextureScaleY = this.texture.options.scale_y || this.texture.options.scale || 1;
    
    mesh.data.set(vars, {
      textures: 'VERTEX_TEXCOORDS'
    });
    
    vars.set(this._set_cache);
  }
});
