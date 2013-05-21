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

Dir[File.expand_path('tasks/support/**/*.rb', File.dirname(__FILE__))].each do |f|
  require f
end

Dir[File.expand_path('tasks/**/*.rake', File.dirname(__FILE__))].each do |task|
  load task
end

require File.join(File.dirname(__FILE__), "lib/jax")
JAX_ROOT = File.dirname(__FILE__)

# 'Guides' tasks & code borrowed from Railties.
desc 'Generate guides (for authors), use ONLY=foo to process just "foo.textile"'
task :guides => 'guides:generate'

# disabled node tests for now, since Jax.DataRegion and friends break it. Rake jasmine:ci instead.
task :default => ['spec', 'travis', 'guides']
# task :release => 'guides:publish'
