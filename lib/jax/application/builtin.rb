class Jax::Application::Builtin < Jax::Engine
  # Builtin is just an Engine whose Configuration is instantiated with a hardcoded
  # path pointing to within the Jax framework (../../../builtin). Engine's initializers
  # take care of everything else, hence the builtin path is structured the same as any
  # Jax plugin.
  
  autoload :Configurable,  "jax/application/builtin/configurable"
  autoload :Configuration, "jax/application/builtin/configuration"
  
  # not sure why this is necessary. self::Configurable must be resolving to something.
  include Jax::Application::Builtin::Configurable
end
