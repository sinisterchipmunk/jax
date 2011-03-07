require 'bundler'
Bundler::GemHelper.install_tasks

require 'jasmine'
load 'jasmine/tasks/jasmine.rake'

desc "compile Jax"
task :compile do
  require 'sprockets'

  secretary = Sprockets::Secretary.new(
          :asset_root => "public",
          :load_path => ["src"],
          :source_files => ["src/jax.js"]
  )
  FileUtils.rm_rf "dist"
  FileUtils.mkdir_p "dist"
  secretary.concatenation.save_to "dist/jax.js"
  
  FileUtils.cp File.join(File.dirname(__FILE__), "src/prototype.js"), File.join(File.dirname(__FILE__), "dist/prototype.js")
end

task :jasmine => :compile
task :default => :compile
