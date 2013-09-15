require 'sprockets'
$:.unshift File.expand_path('../../../lib', File.dirname(__FILE__))
require 'jax/core'

Jasmine.configure do |config|
  root = File.expand_path('../../..', File.dirname(__FILE__))

  config.add_rack_path '/assets', lambda {
    sprockets = Sprockets::Environment.new root

    # HACK this should only be done by railtie
    sprockets.register_engine '.glsl', Jax::Core::ShaderProcessor

    sprockets.append_path 'lib/assets/javascripts'
    sprockets.append_path 'spec/javascripts'
    sprockets.append_path 'vendor/assets/javascripts'

    # add all gems (gl-matrix, shader-script, etc)
    Gem.loaded_specs.each do |name, gem|
      path = Pathname.new(gem.full_gem_path)
      sprockets.append_path path.join('app/assets/javascripts')
      sprockets.append_path path.join('lib/assets/javascripts')
      sprockets.append_path path.join('vendor/assets/javascripts')
    end

    sprockets
  }
end
