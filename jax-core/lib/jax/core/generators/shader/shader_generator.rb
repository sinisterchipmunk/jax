require File.expand_path("../all", File.dirname(__FILE__))
require 'rails/generators/rails/model/model_generator'

module Jax
  module Generators
    class ShaderGenerator < Jax::Generators::NamedBase
      def create_shader_path
        empty_directory File.join("app/assets/jax/shaders", file_name)
      end
      
      def create_common_shader_file
        template "shader_common.glsl.erb",
          File.join('app/assets/jax/shaders', file_name, "common.glsl")
      end

      def create_vertex_shader_file
        template "shader_vertex.glsl.erb",
          File.join('app/assets/jax/shaders', file_name, "vertex.glsl")
      end

      def create_fragment_shader_file
        template "shader_fragment.glsl.erb",
          File.join('app/assets/jax/shaders', file_name, "fragment.glsl")
      end
      
      def create_material_file
        coffee_template_with_fallback "shader_material.js",
          File.join('app/assets/jax/shaders', file_name, "material.js")
      end
      
      def create_manifest_file
        template "shader_manifest.yml.erb",
          File.join('app/assets/jax/shaders', file_name, "manifest.yml")
      end
      
      def create_spec_file
        coffee_template_with_fallback "shader_spec.js",
          File.join('spec/javascripts/jax/shaders', "#{file_name}_spec.js")
      end
    end
  end
end