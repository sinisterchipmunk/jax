require 'sprockets'

module Jax
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
    
    def process_require_everything_matching_directive(subpath)
      # depend on any base subpath directories that may exist
      # this should pick up any new shaders as they are added to app
      context.environment.paths.each do |base_path|
        path = File.join base_path, subpath
        if File.directory? path
          context.depend_on path
        elsif File.directory?(base_path) && base_path =~ /\/jax\/?$/
          # depend on app/assets/jax, lib/assets/jax, etc.
          context.depend_on base_path
        end
      end
      
      files = []
      # context.environment.each_logical_path do |path|
      context.environment.each_file do |path|
        # skip all.js and skip manifest.yml
        path = path.to_s
        next if path == self.file || path =~ /\.yml$/
        attrs = context.environment.attributes_for(path)
        logical_path = attrs.logical_path
        if logical_path[/^#{Regexp::escape subpath}/]
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
