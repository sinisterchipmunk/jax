module Jax
  class Application < Jax::Engine
    autoload :Configurable,  "jax/application/configurable"
    autoload :Configuration, "jax/application/configuration"
    autoload :Railties,      "jax/application/railties"

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
      
      def initialize!
        # return silently because we may have to call initialize automatically.
        # Jax prior to v1.1.0 didn't call #initialize! during boot.
        return self if @initialized
        @initialized = true
        run_initializers(self)
        self
      end

    protected

      def method_missing(*args, &block)
        instance.send(*args, &block)
      end
    end
    
    delegate :plugins, :to => :railties
    
    def railties
      @railties ||= Jax::Application::Railties.new(config)
    end
    
    def detect_shaders(paths)
      for path in paths
        shader_paths = Dir[File.join(path, "*/{vertex,fragment}.ejs")].collect { |d| File.dirname(d) }.uniq
        shader_paths.each do |shader_path|
          shaders.push Jax::Shader.from(shader_path)
        end
      end
    end

    delegate :root, :to => :config
    delegate :routes, :to => :config
    delegate :plugin_repository_url, :plugin_repository_url=, :default_plugin_repository_url, :to => :config
    
    def shader_load_paths
      if !@shader_load_paths
        @shader_load_paths = []
        self.class.initialize!
      end
      @shader_load_paths
    end
    
    def javascript_load_paths
      if !@javascript_load_paths
        @javascript_load_paths = []
        @javascript_load_paths = javascript_source_roots + @javascript_load_paths
      end
      @javascript_load_paths
    end
    
    def javascript_sources
      if !@javascript_sources
        @javascript_sources = []
        self.class.initialize!
      end
      @javascript_sources
    end
    
    def resource_files
      if !@resource_files
        @resource_files = []
        self.class.initialize!
      end
      @resource_files
    end
    
    def javascript_source_roots
      if !@javascript_source_roots
        @javascript_source_roots = []
        self.class.initialize!
      end
      @javascript_source_roots
    end
    
    def asset_paths
      if !@asset_paths
        @asset_paths = []
        self.class.initialize!
      end
      @asset_paths
    end
    
    def shaders
      if !@shaders
        @shaders = []
        def shaders.find(name)
          select { |s| s.name == name }.first
        end

        self.class.initialize!
      end
      @shaders
    end
    
    def initializers
      # jax doesn't have a bootstrapper or initializer yet, but I think these are good ideas
      # so I'm leaving this here as a sort of reminder for how to do it.
      # initializers = Bootstrap.initializers_for(self)
      initializers = nil
      railties.all { |r| initializers = initializers ? initializers + r.initializers : r.initializers }
      initializers = initializers ? initializers + super : super
      # initializers += Finisher.initializers_for(self)
      initializers
    end
  end
end

require File.expand_path("application/builtin", File.dirname(__FILE__))
