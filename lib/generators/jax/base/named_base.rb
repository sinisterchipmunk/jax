module Jax
  module Generators
    class NamedBase < ::Rails::Generators::NamedBase
      include Jax::Generators::CoffeeGenerator
    end
  end
end
