require File.expand_path("../all", File.dirname(__FILE__))
require 'rails/generators/rails/model/model_generator'

module Jax
  module Generators
    class ModelGenerator < Jax::Generators::NamedBase
      argument :attributes, :type => :array, :default => [], :banner => "field:type field:type"
      rails_equivalent { (orm = ::Rails::Generators.options[:rails][:orm]) && "#{orm}:model" }
      
      def create_model_file
        coffee_template_with_fallback "model.js",
          File.join('app/assets/javascripts/jax/models', "#{file_name}.js")
      end
      
      def create_spec_file
        coffee_template_with_fallback "model_spec.js",
          File.join('spec/javascripts/jax/models', "#{file_name}_spec.js")
      end
    end
  end
end