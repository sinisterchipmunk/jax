class Jax::Application::Railties
  def initialize(config)
    @config = config
  end
  
  def all(&block)
    @all ||= railties + engines + plugins
    @all.each &block if block
    @all
  end
  
  def railties
    @railties ||= Rails::Railtie.subclasses.map &:new
  end
  
  def engines
    @engines ||= Jax::Engine.subclasses.map &:new
  end
  
  def plugins
    @plugins ||= begin
      plugin_names = (@config.plugins || [:all]).map { |p| p.to_sym }
      Jax::Plugin.all(plugin_names, @config.paths.vendor.plugins)
    end
  end
end
