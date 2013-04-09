namespace :testbed do
  # due to Rails not allowing more than one Rails::Application, we can only
  # load tasks for the version of Rails made available at the time of loading
  # this file. Note that Rails 4.0 removes this requirement.

  namespace current_testbed do
    path = current_testbed.split(/:/).join('-')
    local = File.join('../../spec/testbeds', path)
    app_path = File.expand_path(local, File.dirname(__FILE__))
    rakefile = File.join(app_path, 'Rakefile')
    load rakefile if File.file? rakefile
  end
end
