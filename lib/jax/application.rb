module Jax
  class Application < Jax::Engine
    autoload :Configurable,  "jax/application/configurable"
    autoload :Configuration, "jax/application/configuration"

    class << self
      private :new

      def configure(&block)
        class_eval(&block)
      end

      def inherited(base)
        raise "You cannot have more than one Jax::Application" if Jax.application
        super

        Jax.application = base.instance
      end
    
      def instance
        @@instance ||= new
      end
      
      def routes
        Jax.application.config.routes
      end

      def respond_to?(*args)
        super || instance.respond_to?(*args)
      end

    protected

      def method_missing(*args, &block)
        instance.send(*args, &block)
      end
    end

    delegate :root, :to => :config
    delegate :routes, :to => :config
    delegate :shader_load_paths, :plugin_repository_url, :to => :config
    
    def plugins
      Dir.glob(root.join("vendor/plugins/*").to_s).collect do |plugin_path|
        relative_plugin_path = plugin_path.sub(/^#{Regexp::escape root.to_s}\/?/, '')
        Jax::Plugin.new(relative_plugin_path)
      end
    end
    
    def shaders
#      @shaders ||= begin
        shaders = []

        shader_paths.each do |name, path|
          shaders << Jax::Shader.from(path)
        end
        
        def shaders.find(name)
          select { |s| s.name == name }.first
        end

        shaders
#      end
    end
    
    def shader_paths
      shader_paths = {}
      shader_load_paths.each do |path|
        full_path = File.directory?(path) ? path : File.expand_path(path, config.root)
        glob = File.join(full_path, "*/{fragment,vertex}.ejs")
        Dir[glob].each do |dir|
          shader_base = File.dirname(dir)
          shader_name = File.basename(shader_base)
          shader_paths[shader_name] = shader_base
        end
      end
      shader_paths
    end
  end
end