namespace :gen_app do
  all_testbeds = []
  namespace_each_gemfile do |gemfile, path|
    version = path.join('-')

    all_testbeds << (['gen_app']+path).join(':')

    desc "generate #{version} testbed app"
    task path.last do
      ENV['BUNDLE_GEMFILE'] = gemfile

      dest = File.expand_path('../../../spec/testbeds', File.dirname(__FILE__))
      app_name = path.join('-')
      rm_rf File.join(dest, app_name)
      mkdir_p dest
      chdir dest
      run "#{path.join ' '} app testbed generation",
        'rails', 'new', app_name, '-q', '--skip-gemfile', '--skip-bundle'
      chdir File.join(dest, app_name)
      run "jax installation into #{app_name}",
        'rails', 'g', 'jax:install'
    end
  end

  desc "Regenerate all testbeds"
  task :all => all_testbeds
end

task :gen_app => "gen_app:#{current_testbed}"