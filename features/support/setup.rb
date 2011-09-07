Before do
  Jax.reset_config!
end

Before("@rails") do
  setup_rails_environment
  route "mount Jax::Engine => '/'"
end
