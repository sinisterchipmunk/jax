require 'jasmine/headless'

Jasmine::Headless::Task.new do |t|
  t.colors = true
end

desc "Run jasmine specs in browser"
task :jasmine do
  FileUtils.mkdir_p "tmp/pids"
  require 'jasmine'
  require 'rspec'
  require 'rspec/core/rake_task'
  RSpec::Core::RakeTask.new(:jasmine_continuous_integration_runner) do |t|
    t.rspec_opts = ["--colour", "--format", ENV['JASMINE_SPEC_FORMAT'] || "progress"]
    t.verbose = true
    t.rspec_opts += ["-r #{File.expand_path '../../spec/support/bootstrap', File.dirname(__FILE__)}"]
    t.pattern = [File.expand_path("./run_specs.rb", File.dirname(__FILE__))]
  end
  Rake::Task["jasmine_continuous_integration_runner"].invoke
end
