module Jax
  module Generators
    class NamedBase < ::Rails::Generators::NamedBase
      unless defined?(COFFEESCRIPT_AVAILABLE)
        begin
          require 'coffee-script'
          COFFEESCRIPT_AVAILABLE = true
        rescue LoadError
          COFFEESCRIPT_AVAILABLE = false
        end
      end

      def self.source_root
        @source_root ||= File.expand_path("../../../../templates", File.dirname(__FILE__))
      end
      
      class_option :without_coffeescript, :type => :boolean, :aliases => "-j", :default => false,
                   :desc => "Indicates whether to generate pure JavaScript instead of CoffeeScript"

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
