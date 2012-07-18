desc "Start the Jax dev server"
task :server do
  require 'jax'
  require 'jax/rails/application'
  require 'shader-script'
  # moved public into spec to a) emphasize that it's for testing and b) avoid
  # conflicting with normal 'public' dirs in current or future Rails versions.
  Jax::Rails::Application.config.paths['public'] = "spec/fixtures/public"
  Jax::Rails::Application.initializer 'jax.testenv' do |app|
    # add back in the path to gem assets, see Jax::Engine for details
    app.config.assets.paths.push File.expand_path('app/assets/jax', File.dirname(__FILE__))
  end
  Jax::Rails::Application.initialize!
  server = Jax::Server.new *(ENV['quiet'] ? ["--quiet"] : [])
  server.start
end
