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

require 'rocco/tasks'
# HACK to prevent rocco documenting Sprockets directives
class Rocco
  alias_method :_parse, :parse
  def parse(data)
    lines = data.split("\n")
    lines.reject! { |line| line =~ /#{Regexp::escape generate_comment_chars[:single]}=/ }
    _parse lines.join("\n")
  end
end

desc "Build API documentation"
Rocco::Task.new :doc, 'doc/', 'lib/**/*.{js,coffee,rb,erb,glsl}', {
  :language => 'js',
  :stylesheet => File.expand_path('templates/rocco.css', File.dirname(__FILE__)),
  :template_file => File.expand_path("templates/rocco_layout.mustache.html", File.dirname(__FILE__))
}

desc "Clobber and rebuild API docs"
task :redoc do
  FileUtils.rm_rf File.expand_path("doc", File.dirname(__FILE__))
  Rake::Task['doc'].invoke
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

namespace :guides do
  # gen docs first because we're going to include a direct link to the JS API
  task :generate do
    rm_rf "guides/output"
    if !ENV["SKIP_API"]
      Rake::Task['doc'].invoke
      mkdir_p "guides/output"
      cp_r "doc/lib", "guides/output/lib"
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
