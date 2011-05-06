require 'active_support/core_ext'

module Jax
  module Generators
    module Material
      class MaterialGenerator < Jax::Generators::Command
        include Thor::Actions
        argument :name, :desc => "The name of this material", :banner => "[name]"
        
        def initialize(args = [], *other)
          chain.unshift args.pop while args.length > 1 # name is arg0
          super(args, *other)
        end
        
        def self.source_root
          File.expand_path("templates", File.dirname(__FILE__))
        end
                
        def material
          template 'material.yml.tt', File.join("app/resources/materials", "#{file_name}.yml")
        end
        
        protected
        def chain
          @chain ||= []
        end
        
        def default_options(name)
          name = name.strip.camelize
          case name
            when 'Texture', 'NormalMap'
              ['type: '+name,
               'path: "/path/to/texture.png"',
               'flip_y: false',
               'scale: 1'
              ]
            when 'ShadowMap'
              ['type: ShadowMap']
            else raise ArgumentError, "Unexpected material processor type: "+name
          end.join("\n    ")
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
