require 'action_controller/railtie'
require 'sprockets/railtie'

module Jax
  module Rails
    # Bootstraps a Rails 3 application for running the Jax dev server in
    # a non-Rails environment. This class is not used in a Rails application.
    class Application < ::Rails::Application
      config.secret_token                      = "e10adc3949ba59abbe56e057f20f883e"
      config.session_store :cookie_store, :key => "_jax_session"
      config.active_support.deprecation        = :log
      config.consider_all_requests_local       = true
      config.action_controller.perform_caching = false
      config.log_level                         = :debug
      config.cache_classes                     = false
      config.assets.enabled = true
      config.assets.version = '1.0'
      config.assets.debug = true
      config.assets.digest = false
      
      # this excludes geometry/triangle/inliner.rb and all jax/**/manifest.yml files
      original = config.assets.precompile[0]
      config.assets.precompile[0] = Proc.new do |path|
        original.call(path) and
        path !~ /(jax|shaders)[\\\/].*manifest\.yml/ and
        path !~ /geometry[\\\/]triangle[\\\/]inliner\.rb$/
      end

      routes do
        mount Jax::Engine => "/", :as => "jax"
      end
    end
  end
end
