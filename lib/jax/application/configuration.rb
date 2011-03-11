class Jax::Application::Configuration
  attr_accessor :view_paths, :root
  
  def initialize
    @view_paths = ['app/views']
    @root = nil
  end
  
  def routes
    if !@routes
      @routes = Jax::Routes.new
      Jax::Routes.load!
    end
    @routes
  end
end
