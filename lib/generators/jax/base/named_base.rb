module Jax
  module Generators
    class NamedBase < ::Rails::Generators::NamedBase
      extend  Jax::Generators::SourceRoot
      include Jax::Generators::CoffeeGenerator
    end
  end
end
