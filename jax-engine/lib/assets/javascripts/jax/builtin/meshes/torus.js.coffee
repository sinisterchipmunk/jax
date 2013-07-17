###
A torus is a donut-shaped mesh.

Options:
  * innerRadius, default: 0.6
  * outerRadius, default: 1.8
  * sides, default: 64
  * rings, default: 128
  
Examples:
    new Jax.Mesh.Torus()
    new Jax.Mesh.Torus
      innerRadius: 1.0
      outerRadius: 3.0
      
###
class Jax.Mesh.Torus extends Jax.Mesh.TriangleStrip
  constructor: (options) ->
    @innerRadius = 0.6
    @outerRadius = 1.8
    @sides = 16
    @rings = 32
    super options
  
  init: (vertices, colors, texes, normals) ->
    innerRadius = @innerRadius
    outerRadius = @outerRadius
    sides = @sides
    rings = @rings
    
    sidedelta = 2 * Math.PI / sides
    ringdelta = 2 * Math.PI / rings
    theta = sintheta = 0
    costheta = 1
    
    for i in [(rings-1)..0]
      theta1 = theta + ringdelta
      costheta1 = Math.cos theta1
      sintheta1 = Math.sin theta1
      phi = 0
      for j in [sides..0]
        phi = phi + sidedelta
        cosphi = Math.cos phi
        sinphi = Math.sin phi
        dist = outerRadius + (innerRadius * cosphi)
        
        normals.push costheta1 * cosphi, -sintheta1 * cosphi, sinphi
        vertices.push costheta1 * dist, -sintheta1 * dist, innerRadius * sinphi
        
        normals.push costheta * cosphi, -sintheta * cosphi, sinphi
        vertices.push costheta * dist, -sintheta * dist, innerRadius * sinphi
      
      theta = theta1
      costheta = costheta1
      sintheta = sintheta1
