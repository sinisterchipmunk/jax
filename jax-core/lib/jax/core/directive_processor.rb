require 'sprockets'

module Jax
  module Core
    class DirectiveProcessor < Sprockets::DirectiveProcessor
      def evaluate(context, locals, &block)
        # this is necessary because we don't *want* to handle shaders here,
        # we want to handle them in Jax::Shader instead.
        begin
          path = context.resolve(context.logical_path).to_s
          if path =~ /\.glsl$/
            data
          else
            super
          end
        rescue Sprockets::FileNotFound # not sure why this can happen
          super
        end
      end
    end
  end
end
