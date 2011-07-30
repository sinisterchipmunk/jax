require 'active_support/core_ext'
require 'rails/initializable'

class Jax::Plugin < Jax::Engine
  autoload :Manifest, 'jax/plugin/manifest'
  
  attr_reader :relative_path
  
  class << self
    def all(list, paths)
      plugins = []
      paths.each do |path|
        Dir["#{path}/*"].each do |plugin_path|
          plugin = new(plugin_path)
          next unless list.include?(plugin.name) || list.include?(:all)
          plugins << plugin
        end
      end

      plugins.sort_by do |p|
        [list.index(p.name) || list.index(:all), p.name.to_s]
      end
    end
  end
  
  def initialize(path)
    super()
    @relative_path = path.sub(/^#{Regexp::escape Jax.root.to_s}\/?/, '')
  end
  
  def manifest
    @manifest ||= begin
      manifest = Jax::Plugin::Manifest.new(name)
      manifest.load
    end
  end
  
  def full_path
    File.expand_path(relative_path, Jax.root)
  end
  
  def name
    File.basename(relative_path)
  end
  
  def config
    @config ||= Jax::Engine::Configuration.new(full_path)
  end
end
