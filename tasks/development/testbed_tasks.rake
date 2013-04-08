namespace :testbed do
  # due to Rails not allowing more than one Rails::Application, we can only
  # load tasks for the version of Rails made available at the time of loading
  # this file. Note that Rails 4.0 removes this requirement.

  namespace current_testbed do
    path = current_testbed.split(/:/).join('-')
    local = File.join('../../spec/testbeds', path)
    app_path = File.expand_path(local, File.dirname(__FILE__))
    load File.join(app_path, 'Rakefile')

    desc "Start server for testbed #{current_testbed}"
    task :server do
      system 'bundle', 'exec', 'rackup', File.join(app_path, 'config.ru'),
              '-p', ENV['PORT'] || '3000'
    end
  end
end
