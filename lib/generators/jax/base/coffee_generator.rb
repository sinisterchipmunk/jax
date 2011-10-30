module Jax
  module Generators
    module CoffeeGenerator
      unless defined?(COFFEESCRIPT_AVAILABLE)
        begin
          require 'coffee-script'
          COFFEESCRIPT_AVAILABLE = true
        rescue LoadError
          COFFEESCRIPT_AVAILABLE = false
        end
      end

      def self.included(base)
        base.class_eval do
          class_option :without_coffeescript, :type => :boolean, :aliases => "-j", :default => false,
                       :desc => "Indicates whether to generate pure JavaScript instead of CoffeeScript"
        end
      end

      protected
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
