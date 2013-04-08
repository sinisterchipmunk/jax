require File.expand_path("../all", File.dirname(__FILE__))

module Jax
  module Generators
    class ModelGenerator < Jax::Generators::RailsBase
      argument :attributes, :type => :array, :default => [], :banner => "field:type field:type"
      rails_equivalent do
        if orm = ::Rails::Generators.options[:rails][:orm]
          "#{orm}:model"
        end
      end
      
      def create_model_file
        coffee_template_with_fallback "model.js",
          File.join('app/assets/jax/models', "#{file_name}.js")
      end
      
      def create_spec_file
        coffee_template_with_fallback "model_spec.js",
          File.join('spec/javascripts/jax/models', "#{file_name}_spec.js")
      end
      
      def create_resource_file
        template 'model_defaults.resource.erb', File.join("app/assets/jax/resources", file_name.pluralize, "default.resource")
      end
    end
  end
end