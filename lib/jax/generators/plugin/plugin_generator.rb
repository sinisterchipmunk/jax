require 'active_support/core_ext'
require 'rest_client'
require 'jax'

module Jax
  module Generators
    module Plugin
      class PluginGenerator < Jax::Generators::Command
        argument :name
        class_option :local, :type => :boolean, :desc => "Does not connect to the plugin server for any reason",
                     :default => false
        include Thor::Actions
        include Jax::Generators::Plugin
        include Jax::Generators::Interactions
        
        def check_for_remote_name_conflicts
          return if options[:local]
          
          message = catch :aborted do
            plugins = find_plugin_list get_remote_plugins_matching(name)
            if plugins.length == 1 && (plugin = plugins.shift)['name'].downcase == name.downcase
              say "A plugin named '#{name}' would conflict with an existing upstream plugin called '#{plugin['name']}'."
              prompt_yn "Attempts to publish your plugin will be rejected. Are you sure you wish to proceed?"
            end
            nil
          end
          if message
            say_status :aborted, message, :yellow
            exit
          end
        end
        
        def check_for_local_name_conflicts
          if File.directory? plugin_base_directory
            message = catch(:aborted) do
              prompt_yn("'#{name}' conflicts with another installed plugin of the same name. Overwrite?")
              FileUtils.rm_rf plugin_base_directory
              say_status :remove, plugin_base_directory, :green
              nil
            end
            if message
              say_status :aborted, message, :yellow
              exit
            end
          end
        end
        
        def create_plugin_directory
          directory "new_plugin", plugin_base_directory
        end
        
        private
        def plugin_base_directory
          Jax.root.join("vendor/plugins", name).to_s
        end
      end
    end
  end
end
