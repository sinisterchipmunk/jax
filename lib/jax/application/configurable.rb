module Jax
  class Application
    module Configurable
      def self.included(base)
        base.extend ClassMethods
      end

      module ClassMethods
        def inherited(base)
          raise "You cannot inherit from a Jax::Application child"
        end
      end

      def config
        @config ||= Jax::Application::Configuration.new(self.class.find_root_with_flag("app", Dir.pwd))
      end
    end
  end
end