module Jax
  module Generators
    class RailsBase < Jax::Generators::NamedBase
      no_tasks do
        class_attribute :rails_equivalent_block
      end
      
      def self.rails_equivalent(&block)
        self.rails_equivalent_block = block
      end
      
      class_option :rails, :type => :boolean, :aliases => '-r', :default => false,
                   :desc => "If true, the equivalent Rails generator will be invoked also."
    
      def initialize(args = [], options = {}, config = {})
        super
        if self.options[:rails] && equiv = rails_equivalent
          args << "--skip-namespace" # otherwise everything ends up in jax/, the opposite of what we want
          ::Rails::Generators.invoke(equiv, args, config)
        end
      end

      protected
      def rails_equivalent
        self.class.rails_equivalent_block && instance_eval(&self.class.rails_equivalent_block)
      end
    end
  end
end

