module Jax
  autoload :Generators,       File.join(File.dirname(__FILE__), "jax/generators/commands")
  autoload :VERSION,          File.join(File.dirname(__FILE__), "jax/version")
  autoload :Version,          File.join(File.dirname(__FILE__), "jax/version")
  autoload :Application,      File.join(File.dirname(__FILE__), "jax/application")
  autoload :Packager,         File.join(File.dirname(__FILE__), "jax/packager")
  autoload :ResourceCompiler, File.join(File.dirname(__FILE__), "jax/resource_compiler")
  autoload :Routes,           File.join(File.dirname(__FILE__), "jax/routes")
  
  class << self
    def application
      @application ||= nil
    end
    
    def application=(application)
      @application = application
    end
    
    def root
      application && application.root
    end
  end
end
