require 'active_support/core_ext'
require 'rest_client'
require 'jax'

module Jax
  module Generators
    module Plugin
      class PluginGenerator < Jax::Generators::Command
        argument :name
        include Thor::Actions
        include Jax::Generators::Plugin
        
        # def check_for_name_conflicts
        #   plugins = get_remote_plugins_matching(name)
        #   p plugins
        # end
      end
    end
  end
end
