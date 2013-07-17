module Jax
  module Generators
    class NamedBase < ::Rails::Generators::NamedBase
      class Error < Thor::Error
      end

      no_tasks do
        def exit(message = "")
          raise Jax::Generators::NamedBase::Error, message
        end
      end

      extend  Jax::Generators::SourceRoot
      include Jax::Generators::CoffeeGenerator
    end
  end
end
