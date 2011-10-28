module Jax
  module Generators
    class NamedBase < ::Rails::Generators::NamedBase
      def self.source_root
        @source_root ||= File.expand_path("../../../../templates", File.dirname(__FILE__))
      end

      include Jax::Generators::CoffeeGenerator
    end
  end
end
