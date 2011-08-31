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


desc "list all TODO items"
task :todo do
  (Dir['src/**/*'] + Dir['lib/**/*']).each do |fi|
    if File.file?(fi) && fi != 'lib/jax/generators/app/templates/public/javascripts/jax.js'
      system("grep -Hni 'todo' '#{fi}'")
    end
  end
end

desc "list all FIXME items"
task :fixme do
  (Dir['src/**/*'] + Dir['lib/**/*']).each do |fi|
    if File.file?(fi) && fi != 'lib/jax/generators/app/templates/public/javascripts/jax.js'
      system("grep -Hni 'fixme' '#{fi}'")
    end
  end
end

desc "list all HACK items"
task :hacks do
  (Dir['src/**/*'] + Dir['lib/**/*']).each do |fi|
    if File.file?(fi) && fi != 'lib/jax/generators/app/templates/public/javascripts/jax.js'
      system("grep -Hni 'hack' '#{fi}'")
    end
  end
end

desc "list all flagged items"
task :flagged do
  Rake::Task['todo'].invoke
  Rake::Task['fixme'].invoke
  Rake::Task['hacks'].invoke
end

desc "compile Jax"
task :compile do
  # generate constants file
  erb = ERB.new(File.read(File.join(File.dirname(__FILE__), "src/constants.yml.erb")))
  File.open(File.join(File.dirname(__FILE__), "src/constants.yml"), "w") { |f| f.puts erb.result(binding) }
  
  jax_root = File.expand_path(File.dirname(__FILE__))
  env = Sprockets::Environment.new jax_root
  env.append_path "src"
  env.append_path "vendor"
  env.append_path "builtin/**/*.js"
  env.append_path jax_root
  env.logger.level = Logger::DEBUG
  rm_rf File.join(jax_root, "dist")
  mkdir_p File.join(jax_root, "dist")
  env['jax.js'].write_to(File.join jax_root, "dist/jax.js")
  puts env['jax.js'].to_s.length
  raise "compiled output includes require directives" if env['jax.js'].to_s =~ /\/\/\s*\=\s*require/
  
  mkdir_p File.join(jax_root, "tmp") unless File.directory?(File.join(jax_root, "tmp"))

  # generate the built-in shaders for testing against (these are not added to the real jax dist because they are
  # regenerated in the user's app)
  rm File.join(jax_root, "tmp/shaders.js") if File.file?(File.join(jax_root, "tmp/shaders.js"))
  File.open(File.join(jax_root, "tmp/shaders.js"), "w") do |f|
    Jax.application.shaders.each { |shader| shader.save_to f }
  end

  puts "generated #{File.join(jax_root, "dist/jax.js")}"
  
  # make sure the app generator copies the correct jax
  cp File.join(jax_root, "dist/jax.js"),
     File.join(jax_root, "lib/jax/generators/app/templates/public/javascripts/jax.js")
  
  puts "(project built)"
end

desc "compile and minify Jax into dist/jax.js and dist/jax-min.js"
task :minify => :compile do
  puts "(minifying...)"
  if system("java", "-jar", File.join(File.dirname(__FILE__), "vendor/yuicompressor-2.4.2.jar"), "dist/jax.js", "-o", "dist/jax-min.js")
    puts "(done. saved to: dist/jax-min.js)"
  else
    puts "(Error while minifying!)"
  end
end

### HACK to add redcloth support to pdoc without changing pdoc itself
class PDoc::Generators::Html::Website < PDoc::Generators::AbstractGenerator
  alias _set_markdown_parser set_markdown_parser
  
  def set_markdown_parser(parser = nil)
    if parser && parser.to_sym == :redcloth
      require 'redcloth'
      self.class.markdown_parser = RedCloth
    else
      _set_markdown_parser(parser)
    end
  end
end

namespace :doc do
  desc "check for common pdoc typos"
  task :check do
    candidates = [
      /\/\*\*(.*?)\*\*\//m,
      /\s*\*.*?\)\s+:/,                #  * - object (Jax.Model) : description
      /\s*\*\s*\-.*?\)\s*\-/,          #  * - object (Jax.Model) - description
      /\s*\*\s*\-[^\n]*?\n\s*\*\*\//m, #  * - object (Jax.Model): description\n  **/
    ]
    
    errors = false

    Dir[File.expand_path("src/**/*.js", File.dirname(__FILE__))].each do |fi|
      next unless File.file?(fi)
      lfi = fi.sub(/^#{Regexp::escape File.expand_path("src/", File.dirname(__FILE__))}\/?/, '')
      candidates.each do |candidate|
        if candidate.multiline?
          content = File.read(fi)
          offset = 0
          lineno = 1
          while m = candidate.match(content[offset...content.length])
            offset += m.offset(0)[1]
            lineno += $`.lines.to_a.length

            if candidate == candidates.first
              full = $~[0]
              # special case -- we're looking for parameters followed by an empty line. If it's missing,
              # pdoc will not correctly parse the params.
              inner = $~[1]
              
              if inner =~ /^\s*\*\s*\-.*/m
                lineno += $`.lines.to_a.length
                inner = $~[0]
                if inner !~ /\*\s*(\*|$)/m
                  errors = true
                  puts "#{lfi}:#{lineno} >\n#{full}"
                end
              end
            else
              errors = true
              puts "#{lfi}:#{lineno} >\n#{$~[0]}"
            end
          end
        else
          File.read(fi).lines.each_with_index do |line,no|
            if line =~ candidate
              errors = true
              puts "#{lfi}:#{no+1} > #{$~[0]}"
            end
          end
        end
      end
    end
    
    exit if errors
  end
  
  desc "build the Jax JavaScript documentation"
  task :js => 'doc:check' do
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
      :markdown_parser => :redcloth,
      # :markdown_parser    => :bluecloth,
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
# task :build   => [:compile, :minify] # make sure to minify the JS code before going to release
task :build => :compile

# disabled node tests for now, since Jax.DataRegion and friends break it. Rake jasmine instead.
task :default => ['test:isolated']#, :node]
