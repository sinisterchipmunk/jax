# used to flag auto-compile. Just makes my life easier.
$JAX_DEVELOPMENT = true
$JAX_RAKE = true

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

DEPENDENCIES = %w(jasmine sprockets treetop bluecloth)
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
require File.expand_path("lib/jax/monkeypatch/jasmine", File.dirname(__FILE__))

desc "compile Jax"
task :compile do
  require 'jax'

  JAX_ROOT = File.dirname(__FILE__)
  # put a dummy Application in place
  class Development < Jax::Application
  end


  # generate the built-in shaders
  # TODO since users will be able to add/edit their own shaders, why not bundle these shaders
  # in the app itself and then drop this phase from the Jax build entirely?
  shader_base = File.join(File.dirname(__FILE__), "tmp/shaders")
  mkdir_p shader_base unless File.directory?(shader_base)
  Jax.application.shaders.each do |shader|
    shader.save_to(File.join(shader_base, "#{shader.name}.js"))
  end
  
  secretary = Sprockets::Secretary.new(
          :root => File.dirname(__FILE__),
          :asset_root => "public",
          :load_path => ["src"],
          :source_files => ["src/jax.js", "builtin/**/*.js"]
  )
  rm_rf "dist"
  mkdir_p "dist"
  secretary.concatenation.save_to "dist/jax.js"
  # note we can't just add sahders to the source_files because shaders use <% %> which sprockets also happens to use.
  # TODO see if we can't just disable the <% %> in sprockets.
  File.open(File.join(File.dirname(__FILE__), "dist/jax.js"), "a+") do |f|
    Jax.application.shaders.each do |shader|
      f.puts File.read(File.join(shader_base, "#{shader.name}.js"))
    end
  end

  puts "generated #{File.expand_path "dist/jax.js", '.'}"
  cp File.join(File.dirname(__FILE__), "dist/jax.js"), 
     File.join(File.dirname(__FILE__), "lib/jax/generators/app/templates/public/javascripts/jax.js")
  
  puts "(project built)"
end

desc "compile and minify Jax into dist/jax.js and dist/jax-min.js"
task :minify => :compile do
  puts "(minifying...)"
  if system("java", "-jar", File.join(File.dirname(__FILE__), "vendor/yuicompressor-2.4.2.jar"), "dist/jax.js", "-o", "dist/jax-min.js")
    puts "(done.)"
  else
    puts "(Error while minifying!)"
  end
end

namespace :doc do
  desc "build the Jax JavaScript documentation"
  task :js do
    require File.join(File.dirname(__FILE__), "lib/jax")
    FileUtils.rm_rf 'doc'
    
    PDoc.run({
      :source_files => [File.join('src', 'jax.js')] + Dir[File.join('src', 'jax', '**', '*.js')],
      :destination  => "doc",
#      :index_page   => 'src/README.markdown',
      :syntax_highlighter => 'coderay',
      :markdown_parser    => :bluecloth,
      :src_code_text => "View source on GitHub &rarr;",
      :src_code_href => proc { |obj|
        "https://github.com/sinisterchipmunk/jax/tree/master/#{obj.file}#L#{obj.line_number}"
      },
      :pretty_urls => false,
      :bust_cache  => false,
      :name => 'Jax WebGL Framework',
      :short_name => 'Jax',
      :home_url => 'http://jax.thoughtsincomputation.com',
      :version => Jax::VERSION,
#      :index_header => "",
#      :footer => '',
#      :assets => 'doc_assets'
    })

    Dir['src/**/.*.pdoc.yaml'].each { |f| FileUtils.rm f }
  end
end

task :jasmine => :compile
task :default => :compile
