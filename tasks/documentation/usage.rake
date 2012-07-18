require 'rocco/tasks'
desc "Build documentation"
task :doc do
  require 'jax'
  require 'jax/rails/application'
  Jax::Rails::Application.config.assets.compress = true # minify

  Rake::Task['just_doc'].invoke
  Rake::Task['compile'].invoke
  dir = File.dirname(__FILE__)
  require 'uglifier'

  src = Uglifier.new.compile(File.read(File.expand_path('tmp/jax.js', dir)))
  File.open(File.expand_path('doc/assets/jax.js', dir), "w") { |f| f.print src }
end

Rocco::Task.new :just_doc, 'doc/generated', 'doc/input/**/*.{js,coffee,rb,erb,glsl}', {
  language: 'coffee-script',
  stylesheet: File.expand_path('templates/rocco.css', File.dirname(__FILE__)),
  template_file: File.expand_path('templates/rocco_layout.mustache.html', File.dirname(__FILE__))
}

desc "Clobber and rebuild API docs"
task :redoc do
  FileUtils.rm_rf File.expand_path("doc/generated", File.dirname(__FILE__))
  Rake::Task['doc'].invoke
end
