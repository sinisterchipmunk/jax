require 'rails/generators'

module Jax
  module Generators
    class NamedBase < ::Rails::Generators::NamedBase
      no_tasks do
        class_inheritable_accessor :rails_equivalent_block
      end
      
      unless defined?(COFFEESCRIPT_AVAILABLE)
        begin
          require 'coffee-script'
          COFFEESCRIPT_AVAILABLE = true
        rescue LoadError
          COFFEESCRIPT_AVAILABLE = false
        end
      end

      def self.source_root
        @source_root ||= File.expand_path("../../../templates", File.dirname(__FILE__))
      end
      
      def self.rails_equivalent(&block)
        self.rails_equivalent_block = block
      end
      
      class_option :without_coffeescript, :type => :boolean, :aliases => "-j", :default => false,
                   :desc => "Indicates whether to generate pure JavaScript instead of CoffeeScript"
      class_option :rails, :type => :boolean, :aliases => '-r', :default => false,
                   :desc => "If true, the Rails model generator will be invoked also."
    
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
      
      def coffee_template_with_fallback(src, dest)
        if COFFEESCRIPT_AVAILABLE && !options['without_coffeescript']
          template "#{src}.coffee.erb", "#{dest}.coffee"
        else
          template "#{src}.erb", dest
        end
      end
    end
  end
end

Dir[File.expand_path("*/*.rb", File.dirname(__FILE__))].each { |generator| require generator }
