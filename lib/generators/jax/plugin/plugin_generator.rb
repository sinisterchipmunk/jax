require File.expand_path("../all", File.dirname(__FILE__))
require 'rest_client'

module Jax
  module Generators
    class PluginGenerator < Jax::Generators::NamedBase
      class_option :local, :type => :boolean, :desc => "Does not connect to the plugin server for any reason",
                   :default => false
      include Jax::Generators::PluginBase
      include Jax::Generators::Actions
      
      def check_for_remote_name_conflicts
        return if options[:local]
        
        message = catch :aborted do
          begin
            plugins = find_plugin_list get_remote_plugins_matching(name)
            if plugins.length == 1 && (plugin = plugins.shift)['name'].downcase == name.downcase
              say "A plugin named '#{name}' would conflict with an existing upstream plugin called '#{plugin['name']}'."
              prompt_yn "Attempts to publish your plugin will be rejected. Are you sure you wish to proceed?"
            end
          rescue RestClient::Exception, Errno::ECONNREFUSED
            say $!.message
            say ""
            say "An error occurred while checking for conflicting plugin names. If"
            say "a plugin named '#{name}' already exists, you will not be able to"
            say "publish your plugin until it is renamed."
            prompt_yn "Do you wish to continue? "
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
            say_status :remove, plugin_relative_directory, :green
            nil
          end
          if message
            say_status :aborted, message, :yellow
            exit
          end
        end
      end
      
      def create_plugin_directory
        directory "new_plugin", plugin_relative_directory
      end
      
      def create_manifest
        Jax::Plugin::Manifest.new(name).save
        say_status :create, File.join("vendor/plugins", name, 'manifest.yml')
      end
      
      private
      def plugin_relative_directory
        File.join "vendor/plugins", name
      end
      
      def plugin_base_directory
        ::Rails.application.root.join(plugin_relative_directory).to_s
      end
    end
  end
end