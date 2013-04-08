module Jax
  class Configuration
    attr_accessor :webgl_start, :concatenate_assets

    def initialize
      @webgl_start = { :controller => "jax/suite", :action => "run_webgl" }
      @concatenate_assets = false
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
