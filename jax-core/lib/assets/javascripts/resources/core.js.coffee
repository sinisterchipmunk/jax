Jax.Material.addResources
	basic:
		type: "Custom"
		layers: [{
			type: "Basic"
		}]

	default:
		type: "Surface"
		intensity:
		  ambient: 1
		  diffuse: 1
		  specular: 1
		shininess: 60
		color:
		  ambient:  "#ffffff"
		  diffuse:  "#cccccc"
		  specular: "#ffffff"

	depthmap:
		type: 'Custom'
		layers: [
		  { type: 'Position' }
		  { type: 'Depthmap' }
		]

	"paraboloid-depthmap":
		type: "Custom"
		layers: [
		  { type: "Paraboloid" }
		  { type: "Depthmap" }
		]

	picking:
		type: "Custom"
		layers: [
		  { type: 'Position' }
		  { type: 'Picking'  }
		]

	ssao:
		type: "Custom"
		layers: [
		  { type: "SSAO" }
		]

	wire:
		type: 'Wire'
		intensity:
		  ambient: 1
		  diffuse: 1
		  specular: 1
		shininess: 60
		color:
		  ambient:  "#ffffff"
		  diffuse:  "#cccccc"
		  specular: "#ffffff"
