module Jax
  autoload :Generators,  File.join(File.dirname(__FILE__), "jax/generators/commands")
  autoload :VERSION,     File.join(File.dirname(__FILE__), "jax/version")
  autoload :Version,     File.join(File.dirname(__FILE__), "jax/version")
  autoload :Application, File.join(File.dirname(__FILE__), "jax/application")
  autoload :Packager,    File.join(File.dirname(__FILE__), "jax/packager")
  
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
