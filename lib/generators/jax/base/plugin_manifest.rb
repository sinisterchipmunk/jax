require 'active_support/hash_with_indifferent_access'

module Jax::Plugin
  class Manifest < ActiveSupport::HashWithIndifferentAccess
    class << self
      def find(name)
        man = new name
        man.load
      end
    end

    def initialize(plugin_name = "")
      super()
      self[:name] = plugin_name
      defaults
    end

    def name
      self[:name]
    end

    def name=(n)
      self[:name] = n
    end

    def version
      self[:version]
    end

    def version=(n)
      self[:version] = n
    end

    def description
      self[:description]
    end

    def description=(n)
      self[:description] = n
    end

    def load
      load_from path
    end

    def load_from(path)
      yml = YAML::load(File.read(path))
      yml.each do |key, value|
        self[key] = value
      end
      self
    end

    def save
      save_to path
    end

    def save_to(path)
      base = File.dirname(path)
      FileUtils.mkdir_p(base) unless File.directory?(base)
      File.open(path, "w") { |f| f.print to_yaml }
      self
    end

    def path
      File.join(::Rails.application.root, "vendor/plugins", name, "manifest.yml")
    end

    def defaults
      self[:description] ||= ""
      self[:version] ||= "0.0.1"
      self
    end
  end
end
