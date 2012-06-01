type: Custom

intensity:
  ambient: 1
  diffuse: 1
  specular: 1
  
shininess: 60

color:
  ambient:  "#0c0c0c"
  diffuse:  "#888888"
  specular: "#ffffff"

layers:
  - type: Position
  - type: VertexColor
  - type: AmbientAttenuated
  - type: LambertDiffuse
  - type: PhongSpecular
  - type: ClampColor
  