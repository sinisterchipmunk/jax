module Jax
  class Configuration
    attr_accessor :webgl_start
    attr_writer   :default_plugin_repository_url
    attr_writer   :plugin_repository_url

    def default_plugin_repository_url
      "http://plugins.jaxgl.com/"
    end

    def plugin_repository_url
      @plugin_repository_url ||=
        config_file[:plugin_repository_url] ||
        ENV['JAX_PLUGIN_REPOSITORY_URL']    ||
        default_plugin_repository_url

      @plugin_repository_url.dup # so that it can't be edited in-place
    end

    def specs
      @specs ||= begin
        specs = Sprockets::Environment.new
        specs.append_path ::Rails.root.join("spec").to_s
        specs.append_path File.expand_path("../../spec/javascripts/helpers", File.dirname(__FILE__))
        
        # make all assets available to specs so they can //=require them as needed
        ::Rails.application.config.assets.paths.each do |path|
          specs.append_path path
        end
        
        specs
      end
    end
    
    def initialize
      @webgl_start = { :controller => "jax/suite", :action => "run_webgl" }
    end
    
    private
    def config_file
      @config_file ||= begin
        config_file = {}.with_indifferent_access
        config_file.merge! hash_from_config_file(File.expand_path(".jax", Thor::Util.user_home))
        config_file.merge! hash_from_config_file(File.expand_path(".jax", ::Rails.application.root))
        config_file
      end
    end

    def hash_from_config_file(path)
      if File.file? path
        hash = YAML::load(File.read(path)) || {}
        raise "Error: #{hash.inspect} is not a hash (read from #{path})" unless hash.kind_of?(Hash)
        hash
      else
        {}
      end
    rescue
      puts $!.message
      puts path
      puts File.read(path)
      raise $!
    end
  end
end
