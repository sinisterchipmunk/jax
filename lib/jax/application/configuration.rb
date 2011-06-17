require 'yaml'

class Jax::Application::Configuration < Jax::Engine::Configuration
  attr_accessor :view_paths
  
  def initialize(*)
    super
    @view_paths = ['app/views']
    read_config_files
  end
  
  def routes
    if !@routes
      @routes = Jax::Routes.new
      Jax::Routes.load!
    end
    @routes
  end
  
  def paths
    @paths ||= begin
      paths = super
      paths.tmp                 "tmp"
      paths.vendor              "vendor"
      paths.vendor.plugins      "vendor/plugins"
      paths
    end
  end
  
  def shader_load_paths
    paths.app.shaders.paths + paths.builtin.shaders.paths
  end
  
  def plugin_repository_url
    @plugin_repository_url ||=
      @config_file[:plugin_repository_url] ||
      ENV['JAX_PLUGIN_REPOSITORY_URL'] ||
      "http://plugins.jaxgl.com/"
      
    @plugin_repository_url.dup # so that it can't be edited in-place
  end
  
  private
  def read_config_files
    @config_file = {}
    @config_file.merge! hash_from_config_file(File.expand_path("~/.jax", File.dirname(__FILE__)))
    @config_file.merge! hash_from_config_file(File.expand_path(".jax", root))
  end
  
  def hash_from_config_file(path)
    if File.file? path
      hash = YAML::load(File.read(path)) || {}
      raise "Error: #{hash.inspect} is not a hash (read from #{path})" unless hash.kind_of?(Hash)
      hash
    else
      {}
    end
  end
end
