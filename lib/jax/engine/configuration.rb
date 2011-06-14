class Jax::Engine::Configuration < Rails::Railtie::Configuration
  attr_reader :root
  attr_writer :autoload_once_paths, :autoload_paths
  
  def initialize(path = nil)
    super()
    if defined?(JAX_ROOT)
      path = JAX_ROOT
    end

    @root = RbConfig::CONFIG['host_os'] =~ /mswin|mingw/ ? Pathname.new(path).expand_path : Pathname.new(path).realpath
  end

  def paths
    @paths ||= begin
      builtin = Pathname.new(File.expand_path("../../../builtin", File.dirname(__FILE__)))
      paths = Rails::Paths::Root.new(@root)
      paths.builtin             builtin.to_s
      paths.builtin.shaders     builtin.join("shaders").to_s
      paths.app                 "app",                 :glob => "*"
      paths.app.controllers     "app/controllers"
      paths.app.helpers         "app/helpers"
      paths.app.models          "app/models"
      paths.app.views           "app/views"
      paths.app.shaders         "app/shaders"
      paths.app.resources       "app/resources",       :glob => "**/*.yml"
      paths.lib                 "lib",                 :load_path => true
      paths.lib.tasks           "lib/tasks",           :glob => "**/*.rake"
      paths.config              "config"
      paths.config.initializers "config/initializers", :glob => "**/*.rb"
      paths.config.locales      "config/locales",      :glob => "*.{rb,yml}"
      paths.config.routes       "config/routes.rb"
      paths.public              "public"
      paths.public.javascripts  "public/javascripts"
      paths.public.stylesheets  "public/stylesheets"
      paths
    end
  end
  
  def autoload_once_paths
    @autoload_once_paths ||= paths.autoload_once
  end

  def autoload_paths
    @autoload_paths ||= paths.autoload_paths
  end

  def root=(path)
    @root = paths.path = Pathname.new(path).expand_path
  end
end
