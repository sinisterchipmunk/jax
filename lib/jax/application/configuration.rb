class Jax::Application::Configuration
  attr_accessor :view_paths, :root
  
  def initialize
    @view_paths = ['app/views']
    @root = nil
  end
end
