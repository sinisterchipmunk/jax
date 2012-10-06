module Jax::Testing::Matchers
  class IncludeLayer
    def initialize(layer_name)
      @layer_name = layer_name
    end

    def matches?(actual)
      !actual.select { |h| h['type'] == @layer_name }.empty?
    end
  end

  # To be matched against a hash, loaded via YAML from a Material file
  def include_layer(name)
    IncludeLayer.new(name)
  end
end
