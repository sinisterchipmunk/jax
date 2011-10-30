describe("Material segment 'texture'", function() {
  var matr;
  
  beforeEach(function() {
    matr = new Jax.Material();
    spyOn(matr, 'prepareShader').andCallThrough();
  });
  
  it("should not replace options if image is POT", function() {
    matr = new Jax.Material({"ambient":{"red":1.0,"green":1.0,"blue":1.0,"alpha":1.0},
      "diffuse":{"red":1.0,"green":1.0,"blue":1.0,"alpha":1.0},
      "specular":{"red":1.0,"green":1.0,"blue":1.0,"alpha":1.0},
      "shininess":30,
      "layers":[
        {"type":"Lighting"},
        {"type":"Texture","path":"/textures/rock.png","flip_y":false,"scale_x":1.0,"scale_y":1.0,"generate_mipmap":true,"min_filter":"GL_NEAREST","mag_filter":"GL_NEAREST","mipmap_hint":"GL_DONT_CARE","format":"GL_RGBA","data_type":"GL_UNSIGNED_BYTE","wrap_s":"GL_REPEAT","wrap_t":"GL_REPEAT","premultiply_alpha":false,"colorspace_conversion":true},
        {"type":"NormalMap","path":"/textures/rockNormal.png","flip_y":false,"scale_x":1.0,"scale_y":1.0,"generate_mipmap":true,"min_filter":"GL_NEAREST","mag_filter":"GL_NEAREST","mipmap_hint":"GL_DONT_CARE","format":"GL_RGBA","data_type":"GL_UNSIGNED_BYTE","wrap_s":"GL_REPEAT","wrap_t":"GL_REPEAT","premultiply_alpha":false,"colorspace_conversion":true}
      ]
    });
    matr.layers[1].texture.image.width = matr.layers[1].texture.image.height = 256;

    waitsFor(function() {
      if (matr.layers[1].texture.loaded) {
        expect(Jax.Util.enumName(matr.layers[1].texture.options.wrap_s)).toEqual("GL_REPEAT");
        return true;
      }
      return false;
    });
  });
  
  it("should compile successfully", function() {
    matr.addLayer(new Jax.Material.Texture(new Jax.Texture("/textures/rss.png")));
    
    new Jax.Mesh({material:matr}).render(SPEC_CONTEXT);
    expect(matr.prepareShader).toHaveBeenCalled();
  });
});
