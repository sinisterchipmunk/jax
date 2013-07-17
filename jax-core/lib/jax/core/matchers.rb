module Jax::Core::Matchers
  class IncludeLayer
    def initialize(layer_name)
      @layer_name = layer_name
    end

    def matches?(actual)
      @actual = actual
      actual =~ /"type":"#{@layer_name}"/
    end

    def failure_message
      "Expected #{@actual.inspect} to include a '#{@layer_name}' layer"
    end

    def negative_failure_message
      "Expected #{@actual.inspect} not to include a '#{@layer_name}' layer"
    end
  end

  # To be matched against a hash, loaded via YAML from a Material file
  def include_layer(name)
    IncludeLayer.new(name)
  end
end
