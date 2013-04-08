require 'rspec/core/rake_task'

namespace :spec do
  path = Pathname.new(File.expand_path('../../spec', File.dirname(__FILE__)))

  namespace_each_gemfile do |gemfile, path|
    version = path.join('-')

    namespace path.last do
      # FIXME how to hide the description that rspec generates instead of
      # just overriding it?
      desc "internal, use spec:#{path.join ':'}"
      RSpec::Core::RakeTask.new("_rspec_") do |t|
        t.pattern = './spec/{lib,controllers,models,generators}/**/*_spec.rb'
        t.rspec_opts = "-Ispec -rtestbeds/#{version}/config/application"
      end
    end

    desc "Run specs for #{version}"
    # ex: `rake spec:rails:3.2`
    task path.last do
      ENV['BUNDLE_GEMFILE'] = gemfile
      Rake::Task["spec:#{path.join(':')}:_rspec_"].invoke
    end
  end
end

# `rake spec` will run rspec for the version of Rails currently available
task :spec => "spec:#{current_testbed}"
