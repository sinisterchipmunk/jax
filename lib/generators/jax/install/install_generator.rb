require 'rails/generators'

module Jax
  module Generators
    class InstallGenerator < ::Rails::Generators::Base
      desc <<DESC
Description:
  Install Jax into your Rails application.
DESC

      def self.source_root
        @source_root ||= File.expand_path("templates", File.dirname(__FILE__))
      end
      
      def route_jax_mount_point
        route %{mount Jax::Rails::Engine => "/jax" unless Rails.env == "production"}
      end
    end
  end
end
