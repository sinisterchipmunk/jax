require 'sprockets'

module Jax
  class Shader < Sprockets::DirectiveProcessor
    def process_require_directive(path)
      super

      # FIXME this is kind of a hacky solution to get function bodies included.
      # Should shaders be rewritten entirely, including the JS APIs?
      shader_name, shader_type = shader_type_and_name_for_path(path)
        
      body.insert 0, "<%= Jax.shader_data(#{shader_name.inspect})[#{shader_type.inspect}] %>\n"
    end
    
    def evaluate(context, locals, &block)
      body = super
      
      shader_name, shader_type = shader_type_and_name_for_path
      "Jax.shader_data(#{shader_name.inspect})[#{shader_type.inspect}] = #{body.inspect};\n"
    end
    
    def shader_type_and_name_for_path(path = nil)
      if path.nil?
        logical_path = context.logical_path
      else
        logical_path = context.environment.attributes_for(context.resolve path).logical_path
      end
      shader_name = File.basename(File.dirname(logical_path))
      shader_type = File.basename(logical_path)
      if (shader_type =~ /\.[^\.]+$/)
        shader_type = $`
      end
      
      [shader_name, shader_type]
    end
  end
end
