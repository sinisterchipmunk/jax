require 'rails/generators'
require 'rails/generators/rails/controller/controller_generator'

unless defined?(COFFEESCRIPT_AVAILABLE)
  begin
    require 'coffee-script'
    COFFEESCRIPT_AVAILABLE = true
  rescue LoadError
    COFFEESCRIPT_AVAILABLE = false
  end
end

module Jax
  module Generators
    class ControllerGenerator < ::Rails::Generators::NamedBase
      def self.source_root
        @source_root ||= File.expand_path("../../../../templates", File.dirname(__FILE__))
      end
      
      argument :actions, :type => :array, :default => [], :banner => "action action"
      class_option :without_coffeescript, :type => :boolean, :aliases => "-j", :default => false,
                   :desc => "Indicates whether to generate pure JavaScript instead of CoffeeScript"
      class_option :rails, :type => :boolean, :aliases => '-r', :default => false,
                   :desc => "If true, the Rails controller generator will be invoked also."
      
      def controller_name
        file_name.camelize
      end
      
      def initialize(args = [], options = {}, config = {})
        super
        if self.options[:rails]
          args << "--skip-namespace" # otherwise everything ends up in jax/, the opposite of what we want
          ::Rails::Generators::ControllerGenerator.start(args, config)
        end
      end
      
      def create_controller_file
        coffee_template_with_fallback "controller.js",
          File.join('app/assets/javascripts/jax/controllers', "#{file_name}_controller.js")
      end
      
      def create_spec_file
        coffee_template_with_fallback "spec.js",
          File.join('app/assets/specs/jax/controllers', "#{file_name}_controller_spec.js")
      end
      
      protected
      def coffee_template_with_fallback(src, dest)
        if COFFEESCRIPT_AVAILABLE && !options['without_coffeescript']
          template "#{src}.coffee.erb", "#{dest}.coffee"
        else
          template "#{src}.erb", dest
        end
      end
    end
  end
end
