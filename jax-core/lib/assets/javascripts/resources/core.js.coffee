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
		type: 'Depthmap'

	"paraboloid-depthmap":
		type: "ParaboloidDepthmap"

	picking:
		type: "Picking"

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
