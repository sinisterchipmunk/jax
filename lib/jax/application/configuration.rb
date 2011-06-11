require 'yaml'

class Jax::Application::Configuration
  attr_accessor :view_paths
  attr_reader :root
  
  def root=(path)
    @root = case path
      when String
        Pathname.new(path)
      else path
    end
  end
  
  def initialize
    @view_paths = ['app/views']
    if defined?(JAX_ROOT)
      @root = RbConfig::CONFIG['host_os'] =~ /mswin|mingw/ ? Pathname.new(JAX_ROOT).expand_path : Pathname.new(JAX_ROOT).realpath
    else
      @root = nil
    end
    read_config_files
  end
  
  def routes
    if !@routes
      @routes = Jax::Routes.new
      Jax::Routes.load!
    end
    @routes
  end
  
  def shader_load_paths
    @shader_load_paths ||= [
      File.expand_path('../../../builtin/shaders', File.dirname(__FILE__)),
      "app/shaders"
    ]
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
