require 'sprockets'

module Jax
  class ShaderProcessor < Sprockets::DirectiveProcessor
    def process_require_all_shaders_directive
      root = pathname.dirname.expand_path

      unless root.directory?
        raise ArgumentError, "require_tree argument must be a directory"
      end

      context.depend_on(root)

      files = []
      # context.environment.each_logical_path do |path|
      context.environment.each_file do |path|
        # skip all.js and skip (deprecated) manifest.yml
        next if path == self.file || path =~ /\.yml$/
        logical_path = context.environment.attributes_for(path).logical_path
        if logical_path[/^shaders\//]
          # skip if logical path has already been processed
          next if files.include?(logical_path)
          files << logical_path
          path = context.resolve(logical_path).to_s
          process_require_directive path
        end
      end
    end
  end
end
