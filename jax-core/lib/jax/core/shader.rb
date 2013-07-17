require 'sprockets'

module Jax
  module Core
    class Shader < Sprockets::DirectiveProcessor
      def self.default_mime_type
        "application/javascript"
      end

      def exports
        @exports ||= {}
      end
      
      def process_require_directive(path)
        super

        # FIXME this is kind of a hacky solution to get function bodies included.
        # Should shaders be rewritten entirely, including the JS APIs?
        shader_name, shader_type = shader_type_and_name_for_path(path)
          
        str = "<%= Jax.import_shader_code(#{shader_name.inspect}, #{shader_type.inspect}) %>\n"
        body.insert 0, str unless body[str]
        body
      end
      
      def evaluate(context, locals, &block)
        body = super
        body = process_exports(body)
        
        shader_name, shader_type = shader_type_and_name_for_path
        
        result = "Jax.shader_data(#{shader_name.inspect})[#{shader_type.inspect}] = #{body.inspect};\n"
        unless exports.empty?
          exports_var = "Jax.shader_data(#{shader_name.inspect})[\"exports\"]"
          exports_str   = "#{exports_var} = #{exports_var} || {};\n"
          exports.each do |name, type|
            exports_str+= "#{exports_var}[#{name.inspect}] = #{type.inspect};\n"
          end
          result.insert 0, exports_str
        end
        result
      end
      
      def process_exports(body, rx = nil)
        if rx
          body.scan(rx).uniq.each do |export|
            # scan gets us mostly there, but we still need the arguments.
            export =~ rx
            type  = $~[1]
            name  = $~[2]
            value = $~[3]
            exports[name] = type
            # we may use type later, when we start actively generating the export code.
            # Currently, that's done in JS.
          end
          body
        else
          process_exports_without_assignment(process_exports_with_assignment(body))
        end
      end
      
      def process_exports_without_assignment(body)
        process_exports body, /export\s*\(\s*([^\s]*),\s*([^\s]*)\s*\);?/
      end
      
      def process_exports_with_assignment(body)
        process_exports body, /export\s*\(\s*([^\s]*),\s*([^\s]*),\s*([^\)]*)\);?/
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
end
