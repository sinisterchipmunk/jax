# used to flag auto-compile. Just makes my life easier.
$JAX_DEVELOPMENT = true
$JAX_RAKE = true

begin
  require 'bundler'
  Bundler::GemHelper.install_tasks
  Bundler.setup
rescue LoadError
  puts " *** You don't seem to have Bundler installed. ***"
  puts "     Please run the following command:"
  puts
  puts "       gem install bundler --version=1.0.15"
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

require File.join(File.dirname(__FILE__), "lib/jax")
JAX_ROOT = File.dirname(__FILE__)
# put a dummy Application in place
class Development < Jax::Application
end


desc "compile Jax"
task :compile do
  # generate constants file
  erb = ERB.new(File.read(File.join(File.dirname(__FILE__), "src/constants.yml.erb")))
  File.open(File.join(File.dirname(__FILE__), "src/constants.yml"), "w") { |f| f.puts erb.result(binding) }
  
  secretary = Sprockets::Secretary.new(
          :root => File.dirname(__FILE__),
          :asset_root => "public",
          :load_path => ["src"],
          :source_files => ["src/jax.js", "builtin/**/*.js"]
  )
  jax_root = File.expand_path(File.dirname(__FILE__))
  rm_rf File.join(jax_root, "dist")
  mkdir_p File.join(jax_root, "dist")
  secretary.concatenation.save_to File.join(jax_root, "dist/jax.js")
  
  mkdir_p File.join(jax_root, "tmp") unless File.directory?(File.join(jax_root, "tmp"))

  # generate the built-in shaders for testing against (these are not added to the real jax dist because they are
  # regenerated in the user's app)
  rm File.join(jax_root, "tmp/shaders.js") if File.file?(File.join(jax_root, "tmp/shaders.js"))
  File.open(File.join(jax_root, "tmp/shaders.js"), "w") do |f|
    Jax.application.shaders.each { |shader| shader.save_to f }
  end

  puts "generated #{File.join(jax_root, "dist/jax.js")}"
  
  # this is now handled by :minify
  # cp File.join(jax_root, "dist/jax.js"),
  #    File.join(jax_root, "lib/jax/generators/app/templates/public/javascripts/jax.js")
  
  puts "(project built)"
end

desc "compile and minify Jax into dist/jax.js and dist/jax-min.js"
task :minify => :compile do
  puts "(minifying...)"
  if system("java", "-jar", File.join(File.dirname(__FILE__), "vendor/yuicompressor-2.4.2.jar"), "dist/jax.js", "-o", "dist/jax-min.js")
    cp File.join(File.dirname(__FILE__), "dist/jax-min.js"),
       File.join(File.dirname(__FILE__), "lib/jax/generators/app/templates/public/javascripts/jax.js")
    puts "(done.)"
  else
    puts "(Error while minifying!)"
  end
end

namespace :doc do
  desc "build the Jax JavaScript documentation"
  task :js do
    require 'erb'
    FileUtils.rm_rf 'doc'
    
    @link_to_guides = true
    @hide_links_to_api_docs = true
    header = ERB.new(File.read(File.expand_path("guides/partials/_top_nav.html.erb", File.dirname(__FILE__)))).result(binding)
    PDoc.run({
      :source_files => (['src/jax.js', 'vendor/glmatrix/glMatrix.js'] +
#                        Dir['vendor/ejs/src/**/*.js'] +
                        Dir['src/jax/**/*.js']),
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
      :home_url => 'http://jaxgl.com',
      :version => Jax::VERSION,
      :templates => "vendor/pdoc_template/html",
      :header => header,
      :index_header => header,
#      :index_header => "",
#      :footer => '',
#      :assets => 'doc_assets'
    })

    Dir['src/**/.*.pdoc.yaml'].each { |f| FileUtils.rm f }
  end
end

namespace :guides do
  # gen doc:js first because we're going to include a direct link to the JS API dox
  task :generate do
    rm_rf "guides/output"
    if !ENV["SKIP_API"]
      Rake::Task['doc:js'].invoke
      mkdir_p "guides/output/api"
      cp_r "doc", "guides/output/api/js"
    end
    ENV["WARN_BROKEN_LINKS"] = "1" # authors can't disable this
    ruby "guides/jax_guides.rb"
  end

  desc 'Validate guides, use ONLY=foo to process just "foo.html"'
  task :validate do
    ruby "guides/w3c_validator.rb"
  end
  
  desc "Publish the guides"
  task :publish => 'guides:generate' do
    require 'rake/contrib/sshpublisher'
    mkdir_p 'pkg'
    `tar -czf pkg/guides.gz guides/output`
    Rake::SshFilePublisher.new("jaxgl.com", "~/guides/public", "pkg", "guides.gz").upload
    `ssh jaxgl.com 'cd ~/guides/public/ && tar -xvzf guides.gz && cp -rf guides/output/* . && rm -rf guides*'`
  end
end

desc "Run javascript tests using node.js"
task :node => :compile do
  system("node", "spec/javascripts/node_helper.js")
end

FileUtils.rm_rf File.expand_path("spec/fixtures/tmp", File.dirname(__FILE__))
require 'rake/testtask'
desc "Run ruby tests using Test::Unit"
# NOT WORKING due to isolation tests failing. Use test:isolated instead.
Rake::TestTask.new("test_unit") do |t|
  t.pattern = "{test,spec}/**/*_test.rb"
  t.libs = ["./test", "./spec"].collect { |f| File.expand_path(f) }.select { |f| File.directory?(f) }
#  t.verbose = true
#  t.warning = true
end

namespace :test do
  task :isolated do
    dir = ENV["TEST_DIR"] || "**"
    ruby = File.join(*RbConfig::CONFIG.values_at('bindir', 'RUBY_INSTALL_NAME'))
    ENV['DO_NOT_ISOLATE'] = '1'
    if ENV['TEST']
      sh(ruby, '-Ispec', ENV['TEST'])
    else
      Dir["spec/#{dir}/*_test.rb"].each do |file|
        next true if file.include?("fixtures")
        sh(ruby, '-Ispec', File.expand_path(file, File.dirname(__FILE__)))
      end
    end
  end
end
  

# 'Guides' tasks & code borrowed from Railties.
desc 'Generate guides (for authors), use ONLY=foo to process just "foo.textile"'
task :guides => 'guides:generate'

task :jasmine => :compile
task :build   => [:compile, :minify] # make sure to minify the JS code before going to release

task :default => ['test:isolated', :node]
