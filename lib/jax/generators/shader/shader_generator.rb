require 'active_support/core_ext'

module Jax
  module Generators
    module Shader
      class ShaderGenerator < Jax::Generators::PluggableCommand
        argument :name, :desc => "The name of this shader", :banner => "[name]"

        def self.source_root
          File.expand_path("templates", File.dirname(__FILE__))
        end

        def check_conflicts
          if Jax.application.shaders.find(file_name) && behavior != :revoke
            raise ArgumentError, "A shader called '#{file_name}' already exists!"
          end
        end
             
        def common
          template_to 'common.ejs'
        end

        def fragment
          template_to 'fragment.ejs'
        end

        def manifest
          template_to 'manifest.yml'
        end

        def material
          template_to 'material.js'
        end

        def vertex
          template_to 'vertex.ejs'
        end

        def spec
          template "spec.js.tt", File.join("spec/javascripts/shaders", "#{file_name}_spec.js")
        end
        
        protected
        def template_to(basename)
          template "#{basename}.tt", path_to(basename)
        end

        def path_to(basename)
          File.join("app/shaders", file_name, basename)
        end

        def banner
          "jax generate shader #{self.arguments.map { |a| a.usage }.join(' ')}"
        end

        def file_name
          name.underscore
        end
        
        def class_name
          name.camelize
        end
        
        def plural_name
          name.pluralize
        end
      end
    end
  end
end
