require 'rake'
require 'jasmine'
require File.expand_path('../monkeypatch/jasmine', File.dirname(__FILE__))

include FileUtils

namespace :jax do
  desc "Generate a standalone Web app"
  task :package do
    Jax::Packager.invoke
  end
  
  desc "Upgrade the Jax javascript libraries to the latest version"
  task :update do
    FileUtils.cp File.join(File.dirname(__FILE__), "../../../lib/jax/generators/app/templates/public/javascripts/jax.js"),
                 File.join(Jax.root, 'public/javascripts/jax.js')
  end
  
  task :generate_files do
    # resources
    Jax::ResourceCompiler.new.save(Jax.root.join 'tmp/resources.js')
    
    # routes
    File.open("tmp/shaders.js", "w") { |file| Jax.application.shaders.each { |shader| shader.save_to file } }
    Jax.application.config.routes.reload!
    File.open(Jax.root.join("tmp/routes.js"), 'w') do |f|
      Jax.application.config.routes.compile(f)
    end
  end
end

# make jasmine call gather_resources first, so that resources can be tested
task :jasmine => 'jax:generate_files'
