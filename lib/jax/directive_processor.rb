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
    
    def depend_on_all_files_in(path)
      context.depend_on path
      Dir.glob(File.join path, "**/*") do |full_path|
        context.depend_on full_path
      end
    end
    
    def process_require_everything_matching_directive(subpath)
      # TODO this method is very dirty. Make it prettier.
      
      # depend on any base subpath directories that may exist
      # this should pick up any new shaders as they are added to app
      context.environment.paths.each do |base_path|
        path = File.join base_path, subpath
        depend_on_all_files_in path if File.directory? path
      end
      
      files = []
      context.environment.each_file do |path|
        # skip all.js and skip manifest.yml
        path = path.to_s
        next if path == self.file || path =~ /\.yml$/
        attrs = context.environment.attributes_for(path)
        logical_path = attrs.logical_path
        if logical_path[/^#{Regexp::escape subpath}/]
          # skip if logical path has already been processed
          ary = [ path, logical_path ]
          files << ary unless files.include?(ary)
        end
      end
      
      # order files so they appear in order: plugin files, then app files.
      plugins_path = 'vendor/plugins'
      numerize = proc { |a| a[plugins_path] ? 0 : 1 }
      files.sort! { |a, b| numerize.call(a[0]) <=> numerize.call(b[0]) }

      # require files, now that they are in order
      files.each do |(path, logical_path)|
        process_require_directive path
      end
    end
  end
end
