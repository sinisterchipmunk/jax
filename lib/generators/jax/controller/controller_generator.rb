require File.expand_path("../all", File.dirname(__FILE__))
require 'rails/generators/rails/controller/controller_generator'

module Jax
  module Generators
    class ControllerGenerator < Jax::Generators::NamedBase
      argument :actions, :type => :array, :default => [], :banner => "action action"
      rails_equivalent { "controller" }
      
      def create_controller_file
        coffee_template_with_fallback "controller.js",
          File.join('app/assets/javascripts/jax/controllers', "#{file_name}_controller.js")
      end
      
      def create_spec_file
        coffee_template_with_fallback "controller_spec.js",
          File.join('spec/javascripts/jax/controllers', "#{file_name}_controller_spec.js")
      end
    end
  end
end
