module Jax
  module Core
    class ShaderProcessor < Sprockets::JstProcessor
      self.default_mime_type = 'application/javascript'

      def prepare
        @namespace = "Jax.shaderTemplates"
      end
    end
  end
end
