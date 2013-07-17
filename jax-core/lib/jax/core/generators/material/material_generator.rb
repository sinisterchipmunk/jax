require File.expand_path("../all", File.dirname(__FILE__))

module Jax
  module Generators
    class MaterialGenerator < Jax::Generators::NamedBase
      class_option :append, :default => false, :type => :boolean,
                   :desc => "if it already exists, append shaders to the end of this material"
      class_option :skip_lighting, :default => false, :type => :boolean,
                   :desc => "do not add diffuse or specular lighting to this material"
                   
      def self.desc(description = nil)
        # TODO This can be removed under future versions of Rails, which use ERB for Usage out of the box.
        # TODO it would help if one could configure the location of USAGE
        return super if description
        usage = source_root && File.expand_path("USAGE", File.dirname(__FILE__))

        @desc ||= if usage && File.exist?(usage)
          ERB.new(File.read(usage)).result(binding)
        else
          super
        end
      end
      
      def self.all_shaders
        shaders = []
        ::Rails.application.assets.each_logical_path do |path|
          if path =~ /shaders\/(.*)\/manifest.yml/
            info = (YAML.load(StringIO.new ::Rails.application.assets[path].to_s) || {}).with_indifferent_access
            info[:name] ||= $1
            info[:description] ||= ""
            shaders << info
          end
        end
        shaders.sort { |a,b| a['name'] <=> b['name'] }
      end
      
      def initialize(args = [], options = [], config = {})
        if args.length > 1
          super([args.shift], options, config)
          @shaders = args
        else
          super
          @shaders = []
        end
      end
      
      def prepend_lighting_shaders
        unless options[:skip_lighting] or File.file?(relative_path)
          unless shader_selected?('lambert_diffuse')
            @shaders.unshift 'lambert_diffuse'
          end
          
          unless shader_selected?('phong_specular')
            @shaders.unshift 'phong_specular'
          end
        end
      end
      
      def create_resource_file
        template 'material.js.coffee.erb', relative_path unless options[:append] and File.file?(absolute_path)
      end
      
      def append_shaders
        options = shader_options
        until options.empty?
          option = options.pop
          gsub_file relative_path, /layers\s*:\s*\[(.*?\n)/, "layers: [\n    #{option.to_json},\\1"
        end
      end
      
      protected
      # tries to find the asset with the given path, returning nil if an error is encountered.
      def try_find_asset(*path)
        ::Rails.application.assets[File.join *path]
      rescue Sprockets::FileOutsidePaths
        return nil
      end
      
      def shader_options
        shaders.collect do |shader|
          asset = try_find_asset("shaders", shader.underscore, "fragment.glsl") ||
                  try_find_asset("shaders", shader.underscore, "vertex.glsl")
                  
          raise ArgumentError, "Couldn't find #{File.join 'shaders', shader.underscore}" unless asset
          
          options = { 'type' => shader.camelize }
          if manifest = try_find_asset("shaders", shader.underscore, "manifest.yml")
            options.merge!((YAML::load(manifest.to_s) || {})['options'] || {})
          end
          
          options
        end
      end
      
      def shader_selected?(name)
        !shaders.select { |shader| shader.underscore == name.underscore }.empty?
      end
      
      def shaders
        @shaders
      end
      
      def absolute_path
        File.expand_path relative_path, destination_root
      end
      
      def relative_path
        File.join material_path, file_name
      end
      
      def material_path
        File.join "app", "assets", "jax", "resources", "materials"
      end
      
      def file_name
        super + ".js.coffee"
      end
    end
  end
end