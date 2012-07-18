desc "Compile jax to tmp/jax.js"
task :compile do
  require 'jax'
  require 'jax/rails/application'
  Jax::Rails::Application.initialize!
  ::Rails.application.assets['jax.js'].write_to("tmp/jax.js")
end
