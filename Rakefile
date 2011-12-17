begin
  require 'bundler'
  Bundler::GemHelper.install_tasks
  Bundler.setup
rescue LoadError
  puts " *** You don't seem to have Bundler installed. ***"
  puts "     Please run the following command:"
  puts
  puts "       gem install bundler"
  exit
rescue Bundler::GemNotFound
  # this runs recursively forever under jruby, so special case failure for that.
  if ENV['NO_MORE_ATTEMPTS'] || RUBY_PLATFORM == "java"
    raise
  else
    ENV['NO_MORE_ATTEMPTS'] = '1'
    system("bundle", "install")
    exec("bundle", "exec", "rake", *ARGV)
  end
end

require 'cucumber/rake/task'
Cucumber::Rake::Task.new(:cucumber) do |t|
  t.cucumber_opts = ["-f", "pretty", "-f", "rerun", "-r", "features", "-o", "features/rerun.txt", "-t", "~@wip"]
  unless ENV['FEATURE']
    if !ENV['ALL'] &&
      File.file?(rerun = File.expand_path("features/rerun.txt", File.dirname(__FILE__))) &&
      (rerun = File.read(rerun).strip).length > 0
      t.cucumber_opts << rerun.split(/\s/)
    else
      t.cucumber_opts << "features"
    end
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

require File.join(File.dirname(__FILE__), "lib/jax")
JAX_ROOT = File.dirname(__FILE__)

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
    
    exit 1 if errors
    puts "\e[32mdocumentation looks good\e[0m"
  end
  
  desc "build the Jax JavaScript documentation"
  task :js => 'doc:check' do
    require 'erb'
    FileUtils.rm_rf 'doc'
    
    @link_to_guides = true
    @hide_links_to_api_docs = true
    header = ERB.new(File.read(File.expand_path("guides/partials/_top_nav.html.erb", File.dirname(__FILE__)))).result(binding)
    PDoc.run({
      :source_files => (['lib/assets/javascripts/jax.js', 'vendor/assets/javascripts/gl-matrix-pdoc.js'] +
#                        Dir['vendor/ejs/src/**/*.js'] +
                        Dir['lib/assets/javascripts/jax/**/*.{js,js.erb}']),
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

desc "Compile jax to tmp/jax.js"
task :compile do
  require 'jax'
  require 'jax/rails/application'
  Jax::Rails::Application.initialize!
  ::Rails.application.assets['jax/application.js'].write_to("tmp/jax.js")
end

desc "Start the Jax dev server"
task :server do
  require 'jax'
  require 'jax/rails/application'
  # moved public into spec to a) emphasize that it's for testing and b) avoid
  # conflicting with normal 'public' dirs in current or future Rails versions.
  Jax::Rails::Application.config.paths['public'] = "spec/fixtures/public"
  Jax::Rails::Application.initialize!
  server = Jax::Server.new *(ENV['quiet'] ? ["--quiet"] : [])
  server.start
end

desc "Run javascript tests using node.js"
task :node do
  unless ENV['SKIP_COMPILE']
    Rake::Task['compile'].invoke
  end
  
  unless system("node_modules/jasmine-node/bin/jasmine-node", "spec/javascripts")
    raise "node specs failed"
  end
end

desc "Run test suite using selenium under Travis-CI"
task :travis do
  ENV['DISPLAY'] = ':99.0'
  Rake::Task['jasmine'].invoke unless ENV["SKIP_WEBGL"]
end

desc "Run jasmine specs in browser"
task :jasmine do
  begin
    server = nil
    result = {}
    th = Thread.new do
      ENV['quiet'] = '1'
      Rake::Task['server'].execute
    end
  
    require 'selenium-webdriver'
    driver = Selenium::WebDriver.for :firefox
    driver.navigate.to "http://localhost:3000/jasmine"
    
    puts driver.title if ENV["DEBUG"]
    if driver.title =~ /Exception/ # Rails exception occurred
      puts driver.page_source
      raise "Rails error occurred requesting jasmine specs"
    end
  
    execjs = proc do |js|
      puts "eval js: #{js}" if ENV['DEBUG']
      result = driver.execute_script js
      puts "     =>  #{result.inspect}" if ENV['DEBUG']
      result
    end

    until execjs.call("return jsApiReporter && jsApiReporter.finished") == true
      sleep 0.1
    end
  
    result = execjs.call(<<-end_code)
    var result = jsApiReporter.results();
    var failures = new Array();
    var results = { };
    for (var i in result) {
      for (var j = 0; j < result[i].messages.length; j++) {
        var msg = result[i].messages[j];
        msg.toString = msg.toString();
        msg.passed = msg.passed();
        if (!msg.passed)
          failures.push(msg);
      }
      results[result[i].result] = results[result[i].result] || 0;
      results[result[i].result]++;
    }
    return { results: results, failure_messages: failures };
    end_code
  ensure
    driver.quit if driver and driver.respond_to?(:quit)
    # server.stop if server
  end
  
  passed = result["results"]["passed"].to_i
  failed = result["results"]["failed"].to_i
  total = passed + failed
  green, red = "\e[32m", "\e[31m"
  color = failed > 0 ? red : green
  puts "#{color}#{total} jasmine specs: #{passed} passed, #{failed} failed\e[0m"
  unless (failure_messages = result["failure_messages"]).empty?
    failure_messages.each do |message|
      puts message["message"]
      puts
      puts message["trace"]["stack"].split(/\n/).collect { |line|
        line['@'] ? line.sub(/^.*\@/, '') : line }.reject { |line|
        line['/jasmine.js?'] }.join("\n")
    end
    raise "jasmine specs failed"
  end
end

require 'rspec/core/rake_task'
RSpec::Core::RakeTask.new

# 'Guides' tasks & code borrowed from Railties.
desc 'Generate guides (for authors), use ONLY=foo to process just "foo.textile"'
task :guides => 'guides:generate'

# disabled node tests for now, since Jax.DataRegion and friends break it. Rake jasmine instead.
task :default => ['spec', 'cucumber', 'travis', 'guides']
task :release => 'guides:publish'
