require 'active_support/core_ext'

module Jax
  module Generators
    module LightSource
      class LightSourceGenerator < Jax::Generators::PluggableCommand
        argument :name, :desc => "The name of this light source", :banner => "[name]"
        argument :type, :default => "point", :desc => "The light type: one of 'point', 'spot', 'directional'",
                :banner => "[point|spot|directional]"
        
        def self.source_root
          File.expand_path("templates", File.dirname(__FILE__))
        end
                
        def light
          template 'light.yml.tt', File.join("app/resources/light_sources", "#{file_name}.yml")
        end
        
        protected
        def jax_light_type
          type = self.type.strip.upcase
          case type
            when 'POINT', 'SPOT', 'DIRECTIONAL' then return type+"_LIGHT"
            else raise ArgumentError, "Unexpected light type: "+type
          end
        end
        
        def banner
          "jax generate light #{self.arguments.map { |a| a.usage }.join(' ')}"
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
