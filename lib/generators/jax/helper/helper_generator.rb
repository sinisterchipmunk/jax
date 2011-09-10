require File.expand_path("../all", File.dirname(__FILE__))

module Jax
  module Generators
    class HelperGenerator < Jax::Generators::NamedBase
      def create_helper
        coffee_template_with_fallback "helper.js",
          File.join('app/assets/jax/helpers', "#{file_name}_helper.js")
      end

      def create_spec
        coffee_template_with_fallback "helper_spec.js",
          File.join('spec/javascripts/jax/helpers', "#{file_name}_helper_spec.js")
      end
    end
  end
end