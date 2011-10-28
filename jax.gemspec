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
  s.description = %q{Framework for creating rich WebGL-enabled applications using JavaScript and Ruby}

  s.add_dependency 'rails',          '~> 3.1.0'
  s.add_dependency 'jquery-rails',   '~> 1.0.13'
  s.add_dependency 'jasmine',        '~> 1.0.2.0'
  s.add_dependency 'rest-client',    '~> 1.6.3'
  s.add_dependency 'minitar',        '~> 0.5.3'
  
  # for the rails3 tests
  s.add_development_dependency 'rspec',          '~> 2.6.0'
  # see Gemfile
  # s.add_development_dependency 'rspec-isolation','~> 0.1.1'
  s.add_development_dependency 'coffee-rails',   '~> 3.1.0'
  s.add_development_dependency 'coderay',        '~> 0.9.7'
  s.add_development_dependency 'sqlite3',        '~> 1.3.4'
  s.add_development_dependency 'sass-rails',     '~> 3.1.0'
  s.add_development_dependency 'uglifier',       '~> 1.0.2'
  s.add_development_dependency 'genspec',        '~> 0.2.0'
  s.add_development_dependency 'selenium-webdriver', '~> 2.9.1'
  
  s.add_development_dependency 'fakeweb',        '~> 1.3.0'
  s.add_development_dependency 'ansi'
  s.add_development_dependency 'turn',           '~> 0.8.2'
  s.add_development_dependency 'cucumber-rails', '~> 1.0.2'
    
  # required by guides
  s.add_development_dependency 'RedCloth',       '~> 4.2'
  s.add_development_dependency 'w3c_validators', '~> 1.2'

  # required by pdoc
  s.add_development_dependency 'treetop',   '~> 1.4.9'
  s.add_development_dependency 'bluecloth', '~> 2.0.11'

  s.rubyforge_project = "jax"

  # Don't include stuff used to build & document jax, the dist file is already built.
  useless_files = `git ls-files -- public/* guides/*`.split("\n")
  
  s.files         = `git ls-files`.split("\n") - useless_files
#                    `git ls-files -- spec/example_app/* public/images/*`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n") - useless_files
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]
end
