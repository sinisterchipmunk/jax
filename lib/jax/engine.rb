require 'pathname'

class ::Jax::Engine < ::Rails::Railtie
  autoload :Configurable,  "jax/engine/configurable"
  autoload :Configuration, "jax/engine/configuration"
  
  class << self
    attr_accessor :called_from
    
    def inherited(base)
      base.called_from = detect_caller unless base.abstract_railtie?
      super
    end

    def find_root_with_flag(flag, default=nil)
      root_path = self.called_from

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
  
  initializer :detect_shaders do |app|
    app.shader_load_paths.concat config.paths.app.shaders.paths
    app.detect_shaders config.paths.app.shaders.to_a
  end
  
  initializer :asset_paths do |app|
    app.asset_paths.concat config.paths.public.to_a
  end
  
  initializer :javascript_source_roots do |app|
    app.javascript_source_roots << config.root.to_s
  end
end
