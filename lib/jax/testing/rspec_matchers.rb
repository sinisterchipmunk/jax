module Jax::Testing::Matchers
  class IncludeLayer
    def initialize(layer_name)
      @layer_name = layer_name
    end

    def matches?(actual)
      raise "Expected a hash, got #{actual.inspect}" unless actual.kind_of?(Hash)
      raise "No layers found in #{actual.inspect}" unless actual['layers']
      !actual['layers'].select { |l| l['type'] == @layer_name }.empty?
    end
  end

  # To be matched against a hash, loaded via YAML from a Material file
  def include_layer(name)
    IncludeLayer.new(name)
  end
end
