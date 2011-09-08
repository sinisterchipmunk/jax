$cucumber_root = FileUtils.pwd

Before do
  FileUtils.rm_rf File.join($cucumber_root, "tmp/cache").to_s
  Jax.reset_config!
end

Before("@rails") do
  setup_rails_environment
  route "mount Jax::Engine => '/'"
end
