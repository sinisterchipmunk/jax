class Jax::Application::Builtin::Configuration < Jax::Engine::Configuration
  def initialize(*)
    super(File.expand_path("../../../../builtin", File.dirname(__FILE__)))
  end
end
