begin
  require 'bundler'
  Bundler::GemHelper.install_tasks
rescue LoadError
  puts " *** You don't seem to have Bundler installed. ***"
  puts "     Please run the following command:"
  puts
  puts "       gem install bundler --version=1.0.10"
  exit
end

DEPENDENCIES = %w(jasmine sprockets)
DEPENDENCIES.each do |dep|
  begin
    require dep
  rescue LoadError
    system("bundle", "install")
    exec("bundle", "exec", "rake", *ARGV)
  end
end

# pdoc is a different beast because the released gem seems to be quite dated,
# and is incompatible with Ruby 1.9.2. We'll grab the latest from git, instead.
begin
  require File.join(File.dirname(__FILE__), 'vendor/pdoc/lib/pdoc')
rescue LoadError
  puts "You don't seem to have pdoc. Fetching..."
  if !system("git", "submodule", "init") || !system("git", "submodule", "update")
    puts "Couldn't fetch pdoc. Make sure you have git installed."
    exit
  end
  require File.join(File.dirname(__FILE__), 'vendor/pdoc/lib/pdoc')
end

load 'jasmine/tasks/jasmine.rake'

desc "compile Jax"
task :compile do

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

namespace :doc do
  desc "build the Jax JavaScript documentation"
  task :js do
    puts "TODO use pdoc to generate the JS dox"
  end
end

task :jasmine => :compile
task :default => :compile
