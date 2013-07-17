# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "jax/version"

Gem::Specification.new do |s|
  s.name        = "jax"
  s.version     = Jax::VERSION
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["Colin MacKenzie IV"]
  s.email       = ["sinisterchipmunk@gmail.com"]
  s.homepage    = "http://jaxgl.com"
  s.summary     = %q{Framework for creating rich WebGL-enabled applications using JavaScript and Ruby}
  s.description = %q{
    Framework for creating rich WebGL-enabled applications using JavaScript 
    and Ruby. Can be used stand-alone to create static JavaScript documents, 
    or integrated seamlessly with Ruby on Rails to build dynamic WebGL 
    applications.
  }

  s.add_dependency 'jax-core'
  s.add_dependency 'jax-engine'

  s.add_development_dependency 'rocco'
  s.add_development_dependency 'jshintrb'
  s.add_development_dependency 'RedCloth',       '~> 4.2'
  s.add_development_dependency 'w3c_validators', '~> 1.2'

  s.rubyforge_project = "jax"

  # Don't include stuff used to build & document jax
  # otherwise the gem will get huge. Also don't include the other gems.
  useless_files = `git ls-files -- public guides doc jax-core jax-engine`.split("\n")
  
  s.files         = `git ls-files`.split("\n") - useless_files
  s.test_files    = `git ls-files -- spec features`.split("\n") - useless_files
  s.executables   = `git ls-files -- bin`.split("\n").map do |f|
    File.basename(f)
  end
  s.require_paths = ["lib"]
end
