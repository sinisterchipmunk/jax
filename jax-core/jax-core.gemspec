# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

Gem::Specification.new do |spec|
  spec.name          = "jax-core"
  spec.version       = "3.0.0.rc3"
  spec.authors       = ["Colin MacKenzie IV"]
  spec.email         = ["sinisterchipmunk@gmail.com"]
  spec.description   = %q{Railtie and assets for Jax, the WebGL Engine for Rails}
  spec.summary       = %q{Railtie and assets for Jax, the WebGL Engine for Rails}
  spec.homepage      = "http://jaxgl.com"
  spec.license       = "MIT"

  spec.files         = `git ls-files`.split($/)
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_dependency "railties"
  spec.add_dependency "jquery-rails"
  spec.add_dependency 'gl-matrix-rails'
end
