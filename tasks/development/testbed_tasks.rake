require 'testbeds/rake'

each_testbed do |testbed|
  desc "Run specs for #{testbed.name}"
  task :rspec do
    require 'rspec/core/rake_task'
    ENV['BUNDLE_GEMFILE'] = testbed.gemfile
    unless Rake::Task.task_defined?("_rspec_")
      RSpec::Core::RakeTask.new("_rspec_") do |t|
        t.pattern = './spec/{lib,controllers,models,generators}/**/*_spec.rb'
        t.rspec_opts = "-Ispec -r#{testbed.dependencies.join(' -r')}"
      end
    end

    Rake::Task["_rspec_"].invoke
    Rake::Task["_rspec_"].reenable
  end
end

# `rake spec` will run rspec for the version of Rails currently available
desc "run all specs in all testbeds"
task :rspec do
  each_testbed do |testbed|
    Rake::Task["#{testbed.namespace}:spec"].invoke
  end
end
