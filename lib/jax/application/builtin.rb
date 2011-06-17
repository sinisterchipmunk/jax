class Jax::Application::Builtin < Jax::Engine
  initializer :builtin_shaders do |app|
    app.detect_shaders config.paths.builtin.shaders.to_a
  end
end
