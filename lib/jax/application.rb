require "active_support/core_ext"

module Jax
  class Application
    autoload :Configuration, "jax/application/configuration"
    
    class << self
      def inherited(base)
        raise "You cannot have more than one Jax::Application" if Jax.application
        super
        
        base.called_from = begin
          # Remove the line number from backtraces making sure we don't leave anything behind
          call_stack = caller.map { |p| p.sub(/:\d+.*/, '') }
          File.dirname(call_stack.detect { |p| p !~ %r[jax[\w.-]*/lib/jax] })
        end
        
        Jax.application = base.instance
        Jax.application.config.root ||= Jax.application.find_root_with_flag("app")
      end

      def config
        @config ||= Jax::Application::Configuration.new
      end
      
      def instance
        @instance ||= new
      end
      
      def called_from
        @called_from ||= nil
      end
      
      def called_from=(where)
        @called_from = where
      end
      
      def routes
        Jax.application.config.routes
      end
    end

    delegate :config, :to => "self.class"
    delegate :root, :to => :config
    delegate :routes, :to => :config
    
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
      config.shader_load_paths.each do |path|
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

    def find_root_with_flag(flag, default=nil)
      root_path = self.class.called_from
  
      while root_path && File.directory?(root_path) && !File.exist?("#{root_path}/#{flag}")
        parent = File.dirname(root_path)
        root_path = parent != root_path && parent
      end
  
      root = File.exist?("#{root_path}/#{flag}") ? root_path : default
      raise "Could not find root path for #{self}" unless root
  
      RbConfig::CONFIG['host_os'] =~ /mswin|mingw/ ?
        Pathname.new(root).expand_path : Pathname.new(root).realpath
    end
  end
end