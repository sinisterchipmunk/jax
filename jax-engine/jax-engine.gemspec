# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)

Gem::Specification.new do |s|
  s.name        = "jax-engine"
  s.version     = "3.0.0.rc3"
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

  s.add_dependency 'railties',          '>= 3.1'
  s.add_dependency 'jquery-rails'
  s.add_dependency 'jasmine-rails'
  s.add_dependency 'jax-core'

  s.add_development_dependency 'testbeds'
  s.add_development_dependency 'rspec-rails'
  s.add_development_dependency 'rails',          '>= 3.1'
  s.add_development_dependency 'rspec',          '~> 2'
  s.add_development_dependency 'coffee-rails',   '>= 3'
  s.add_development_dependency 'coderay',        '~> 1'
  s.add_development_dependency 'sqlite3',        '~> 1'
  s.add_development_dependency 'sass-rails',     '>= 3'
  s.add_development_dependency 'uglifier',       '~> 1'
  s.add_development_dependency 'genspec'
  s.add_development_dependency 'selenium-webdriver', '~> 2'
  s.add_development_dependency 'ansi'
  # s.add_development_dependency 'cucumber-rails'
  s.add_development_dependency 'shader-script'
  s.add_development_dependency 'ejs'
  s.add_development_dependency 'jshintrb'
    
  s.rubyforge_project = "jax-engine"

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- spec features`.split("\n")
  s.executables   = `git ls-files -- bin`.split("\n").map do |f|
    File.basename(f)
  end
  s.require_paths = ["lib"]
end
