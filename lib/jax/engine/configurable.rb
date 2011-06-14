module Jax
  class Engine
    module Configurable
      def self.included(base)
        base.extend ClassMethods
      end

      module ClassMethods
        def inherited(base)
          raise "You cannot inherit from a Jax::Engine child"
        end
      end

      def config
        @config ||= Jax::Engine::Configuration.new(self.class.find_root_with_flag("app", Dir.pwd))
      end
    end
  end
end