require 'jax/version'
require File.expand_path("../all", File.dirname(__FILE__))

module Jax
  module Generators
    class ApplicationGenerator < Jax::Generators::NamedBase
      class_option :skip_bundle, :type => :boolean, :default => false, :desc => "Don't run bundle install"
      
      def generate_application
        directory "app", file_name
      end
      
      def create_jax_application_controller
        coffee_template_with_fallback "application_controller.js", 'app/assets/jax/controllers/application_controller.js'
      end

      def create_jax_application_helper
        coffee_template_with_fallback "application_helper.js", 'app/assets/jax/helpers/application_helper.js'
      end
      
      def run_bundle
        inside file_name do
          bundle_command('install') unless options[:skip_bundle]
        end
      end

      protected
      # this comes from Rails.
      def bundle_command(command)
        say_status :run, "bundle #{command}"

        # We are going to shell out rather than invoking Bundler::CLI.new(command)
        # because `rails new` loads the Thor gem and on the other hand bundler uses
        # its own vendored Thor, which could be a different version. Running both
        # things in the same process is a recipe for a night with paracetamol.
        #
        # We use backticks and #print here instead of vanilla #system because it
        # is easier to silence stdout in the existing test suite this way. The
        # end-user gets the bundler commands called anyway, so no big deal.
        #
        # Thanks to James Tucker for the Gem tricks involved in this call.
        print `"#{Gem.ruby}" -rubygems "#{Gem.bin_path('bundler', 'bundle')}" #{command}`
      end
    end
  end
end
