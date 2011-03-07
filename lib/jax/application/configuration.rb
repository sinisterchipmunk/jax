class Jax::Application::Configuration
  attr_accessor :view_paths
  
  def initialize
    @view_paths = ['app/views']
  end
end
