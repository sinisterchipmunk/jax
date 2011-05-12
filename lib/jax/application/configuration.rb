class Jax::Application::Configuration
  attr_accessor :view_paths, :root
  
  def initialize
    @view_paths = ['app/views']
    if defined?(JAX_ROOT)
      @root = RbConfig::CONFIG['host_os'] =~ /mswin|mingw/ ? Pathname.new(JAX_ROOT).expand_path : Pathname.new(JAX_ROOT).realpath
    else
      @root = nil
    end
  end
  
  def routes
    if !@routes
      @routes = Jax::Routes.new
      Jax::Routes.load!
    end
    @routes
  end
  
  def shader_load_paths
    @shader_load_paths ||= [
      File.expand_path('../../../builtin/shaders', File.dirname(__FILE__)),
      "app/shaders"
    ]
  end
end
