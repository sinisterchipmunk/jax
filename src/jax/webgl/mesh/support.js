// Support functions used by Jax.Mesh

function setColorCoords(self, count, color, coords) {
  var i, j;
  var num_colors = color.length;
  if (num_colors > 4) throw new Error("Color should have at most 4 components");
  for (i = 0; i < count*4; i += 4)
  {
    for (j = 0; j < num_colors; j++)
      coords[i+j] = color[j];
    for (j = num_colors; j < 4; j++) {
      coords[i+j] = 1;
    }
  }
}

function findMaterial(name_or_instance) {
  if (typeof(name_or_instance) == "string")
    return Jax.Material.find(name_or_instance);
  else if (name_or_instance.isKindOf && name_or_instance.isKindOf(Jax.Material))
    return name_or_instance;
  
  throw new Error("Material must be an instance of Jax.Material, or "+
                  "a string representing a material in the Jax material registry");
}

function calculateBounds(self, vertices) {
  self.bounds = {left:null,right:null,top:null,bottom:null,front:null,back:null,width:null,height:null,depth:null};
  var i, v;
  
  for (i = 0; i < vertices.length; i++)
  {
    // x, i % 3 == 0
    v = vertices[i];
    if (self.bounds.left  == null || v < self.bounds.left)   self.bounds.left   = v;
    if (self.bounds.right == null || v > self.bounds.right)  self.bounds.right  = v;
    
    // y, i % 3 == 1
    v = vertices[++i];
    if (self.bounds.bottom== null || v < self.bounds.bottom) self.bounds.bottom = v;
    if (self.bounds.top   == null || v > self.bounds.top)    self.bounds.top    = v;
    
    // z, i % 3 == 2
    v = vertices[++i];
    if (self.bounds.front == null || v > self.bounds.front)  self.bounds.front  = v;
    if (self.bounds.back  == null || v < self.bounds.back)   self.bounds.back   = v;
  }
  
  self.bounds.width = self.bounds.right - self.bounds.left;
  self.bounds.height= self.bounds.top   - self.bounds.bottom;
  self.bounds.depth = self.bounds.front - self.bounds.back;
}
