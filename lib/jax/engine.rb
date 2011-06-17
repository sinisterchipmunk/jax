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
  
  initializer :javascript_sources do |app|
    sources = []
    %w(helpers models controllers views shaders).collect do |base|
      config.paths.app.send(base).to_a.each do |path|
        sources.concat Dir[File.join(path, "**/*.js")]
      end
    end
    app.javascript_sources.concat sources.uniq
  end
  
  initializer :resource_files do |app|
    app.resource_files.concat config.paths.app.resources.to_a
  end
end
