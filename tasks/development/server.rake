desc "Start the Jax dev server"
task :server do
  require 'jax'
  require 'jax/rails/application'
  require 'shader-script'
  # moved public into spec to a) emphasize that it's for testing and b) avoid
  # conflicting with normal 'public' dirs in current or future Rails versions.
  Jax::Rails::Application.config.paths['public'] = "spec/fixtures/public"
  Jax::Rails::Application.initialize!
  rest = ENV['PORT'] ? ["--port", ENV['PORT']] : []
  server = Jax::Server.new *(ENV['quiet'] ? ["--quiet", rest].flatten : rest)
  server.start
end
