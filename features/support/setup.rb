$cucumber_root = FileUtils.pwd

Before do
  FileUtils.rm_rf File.join($cucumber_root, "tmp/cache").to_s
  Jax.reset_config!

  ENV['RAILS_ROOT'] = File.join($cucumber_root, 'tmp/rails-cukes').to_s
  FileUtils.rm_rf File.join($cucumber_root, "tmp/rails-cukes").to_s
  setup_rails_environment

  # boot the app, failing silently if it's already booted
  # silent failure is necessary because we can't boot for
  # each feature in isolation
  begin
    # App.initialize!
    Jax::Rails::Application.initialize!
  rescue
    if $!.message != "Application has been already initialized."
      raise
    end
  end
end

After do
  # clear out cache since I can't seem to disable it entirely. (Anybody know why???)
  FileUtils.rm_rf File.expand_path("../../tmp/cache", File.dirname(__FILE__))
end
