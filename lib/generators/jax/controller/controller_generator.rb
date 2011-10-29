require File.expand_path("../all", File.dirname(__FILE__))

module Jax
  module Generators
    class ControllerGenerator < Jax::Generators::RailsBase
      argument :actions, :type => :array, :default => [], :banner => "action action"
      class_option :without_index, :type => :boolean, :default => false,
                   :desc => "skip the default 'index' action unless explicitly specified"
      rails_equivalent { "controller" }
      
      def add_index_action
        actions.unshift 'index' unless actions.include?('index') or options[:without_index]
      end
      
      def create_controller_file
        coffee_template_with_fallback "controller.js",
          File.join('app/assets/jax/controllers', "#{file_name}_controller.js")
      end
      
      def create_spec_file
        coffee_template_with_fallback "controller_spec.js",
          File.join('spec/javascripts/jax/controllers', "#{file_name}_controller_spec.js")
      end
      
      def create_view_file
        for action in actions
          @action_name = action
          coffee_template_with_fallback "view.js",
            File.join('app/assets/jax/views', file_name, "#{action}.js")
        end
      end
      
      private
      attr_reader :action_name
    end
  end
end
