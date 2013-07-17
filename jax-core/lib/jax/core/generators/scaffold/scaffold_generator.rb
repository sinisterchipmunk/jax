require File.expand_path("../all", File.dirname(__FILE__))

module Jax
  module Generators
    class ScaffoldGenerator < Jax::Generators::RailsBase
      argument :attributes, :type => :array, :default => [], :banner => "field:type field:type"
      rails_equivalent { 'scaffold' }
      
      def invoke_model_generator
        ::Rails::Generators.invoke "jax:model", [name] + attributes + option_args,
                                   :destination_root => destination_root,
                                   :shell => shell
      end
      
      def invoke_controller_generator
        ::Rails::Generators.invoke "jax:controller", [name] + option_args,
                                   :destination_root => destination_root,
                                   :shell => shell
      end
      
      def invoke_material_generator
        ::Rails::Generators.invoke "jax:material", [name] + option_args,
                                   :destination_root => destination_root,
                                   :shell => shell
      end
      
      protected
      def option_args
        [].tap do |args|
          args << "--without-coffeescript" if options[:without_coffeescript]
        end
      end
    end
  end
end