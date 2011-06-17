module Jax::Application::Builtin::Configurable
  def config
    @config ||= Jax::Application::Builtin::Configuration.new(self.class.find_root_with_flag("app", Dir.pwd))
  end
end
