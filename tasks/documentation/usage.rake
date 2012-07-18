require 'rocco/tasks'

namespace :doc do
  task :build_assets => :compile do
    # minify the compiled assets
    dir = File.dirname(__FILE__)
    require 'uglifier'

    src = Uglifier.new.compile(File.read(File.expand_path('../../tmp/jax.js', dir)))
    File.open(File.expand_path('../../doc/assets/jax.js', dir), "w") { |f| f.print src }
  end

  Rocco::Task.new :build_docs, 'doc/generated', 'doc/input/**/*.{js,coffee,rb,erb,glsl}', {
    :language => 'coffee-script',
    :stylesheet => File.expand_path('../../templates/rocco.css', File.dirname(__FILE__)),
    :template_file => File.expand_path('../../templates/rocco_layout.mustache.html', File.dirname(__FILE__))
  }

  task :clobber do
    FileUtils.rm_rf File.expand_path("../../doc/generated", File.dirname(__FILE__))
    Rake::Task['doc'].invoke
  end
end

desc "Build documentation"
task :doc => ['doc:build_assets', 'doc:build_docs']

desc "Clobber and rebuild API docs"
task :redoc => ['doc:clobber', 'doc']
