$cucumber_root = FileUtils.pwd

Before do
  FileUtils.rm_rf File.join($cucumber_root, "tmp/cache").to_s
  Jax.reset_config!
end

Before("@rails") do
  setup_rails_environment
  create_directory "app/assets/jax/shaders"
  route "mount Jax::Engine => '/'"
end

After do
  # clear out cache since I can't seem to disable it entirely. (Anybody know why???)
  FileUtils.rm_rf File.expand_path("../../tmp/cache", File.dirname(__FILE__))
end
