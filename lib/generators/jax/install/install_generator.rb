require 'rails/generators'

module Jax
  module Generators
    class InstallGenerator < ::Rails::Generators::Base
      include Jax::Generators::CoffeeGenerator

      desc <<DESC
Description:
  Install Jax into your Rails application.
DESC

      def route_jax_mount_point
        route %{mount Jax::Engine => "/jax" unless Rails.env == "production"}
      end
      
      def create_jax_application_controller
        coffee_template_with_fallback "application_controller.js", 'app/assets/jax/controllers/application_controller.js'
      end

      def create_jax_application_helper
        coffee_template_with_fallback "application_helper.js", 'app/assets/jax/helpers/application_helper.js'
      end
    end
  end
end
