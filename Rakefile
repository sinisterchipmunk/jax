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

require 'testbeds/rake'

Dir[File.expand_path('tasks/support/**/*.rb', File.dirname(__FILE__))].each do |f|
  require f
end

Dir[File.expand_path('tasks/**/*.rake', File.dirname(__FILE__))].each do |task|
  load task
end

# 'Guides' tasks & code borrowed from Railties.
desc 'Generate guides (for authors), use ONLY=foo to process just "foo.textile"'
task :guides => 'guides:generate'

# TODO we should also add the 'travis' task, but right now we can't
# because travis has no WebGL support.
desc 'run all tests and build all documentation'
task :default => ['guides'] do
  chdir 'jax-core' do
    raise 'jax-core failed' unless system 'rake'
  end

  chdir 'jax-engine' do
    raise 'jax-engine failed' unless system 'rake'
  end
end

# task :release => 'guides:publish'
