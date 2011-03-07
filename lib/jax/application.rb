module Jax
  class Application
    autoload :Configuration, "jax/application/configuration"
    
    class << self
      def config
        @config ||= Jax::Application::Configuration.new
      end
    end
  end
end