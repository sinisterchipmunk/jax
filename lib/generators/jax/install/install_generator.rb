require 'rails/generators'
require 'generators/jax/all'

module Jax
  module Generators
    class InstallGenerator < ::Rails::Generators::Base
      include Jax::Generators::CoffeeGenerator
      extend  Jax::Generators::SourceRoot

      desc <<DESC
Description:
  Install Jax into your Rails application.
DESC

      def route_jax_mount_point
        in_root do
          if File.file? 'config/routes.rb'
            route %{mount Jax::Engine => "/jax" unless Rails.env == "production"}
          end
        end
      end
      
      def create_example_html
        copy_file 'example_page.html', 'public/jax_example.html'
      end
      
      def create_jax_application_controller
        coffee_template_with_fallback "application_controller.js", 'app/assets/jax/controllers/application_controller.js'
      end

      def create_jax_application_helper
        coffee_template_with_fallback "application_helper.js", 'app/assets/jax/helpers/application_helper.js'
      end

      def create_jax_manifest_file
        coffee_template_with_fallback "manifest.js", 'app/assets/jax/jax.js'
      end

      def create_jax_jasmine_helpers
        coffee_template_with_fallback 'jasmine/jax_helpers.js', 'spec/javascripts/helpers/jax_helpers.js'
      end
      
      def clear_rails_cache
        # Installs can include changes to how resources are compiled,
        # and since the files themselves don't change, their cached
        # copies may become invalid.
        remove_dir 'tmp/cache'
      end
      
      def talk_about_restarting
        unless shell.mute?
          say "If the development server is running, please restart it now."
        end
      end
    end
  end
end
