require File.expand_path("../all", File.dirname(__FILE__))

module Jax
  module Generators
    class HelperGenerator < Jax::Generators::NamedBase
      def create_helper
        coffee_template_with_fallback "helper.js",
          File.join('app/assets/jax/helpers', "#{underscored_helper_name}.js")
      end

      def create_spec
        coffee_template_with_fallback "helper_spec.js",
          File.join('spec/javascripts/jax/helpers', "#{underscored_helper_name}_spec.js")
      end
      
      protected
      def underscored_helper_name
        if file_name =~ /_helper$/
          file_name
        else
          "#{file_name}_helper"
        end
      end

      def camelized_helper_name
        underscored_helper_name.camelize
      end
    end
  end
end