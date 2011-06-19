require 'active_support/core_ext'
require 'rest_client'
require 'jax'
require 'archive/tar/minitar'

module Jax
  module Generators
    module Plugin
      class PluginManager < Thor
        include Thor::Actions
        include Jax::Generators::Plugin
        include Jax::Generators::Interactions
        
        desc "install NAME [NAME2...]", "Installs the named plugin from the plugin repository"
        long_desc "Searches for a plugin by the specified name and installs it. The "   \
                  "search is case-insensitive. If an exact match (other than case) is " \
                  "found, the matching plugin will be installed. Otherwise, a list of " \
                  "potential matches will be shown, and you will be prompted with a "   \
                  "selection."
        method_option :version, :type => :string, :default => false, :aliases => '-v',
                      :desc => "The exact version to install. If not given, the latest will be used."
        def install(name, *other_names)
          catch(:complete) do
            message = catch(:aborted) do
              list = matching_plugins(name)
              if list.empty?
                raise "No plugin names match or begin with the text '#{name}'."
              elsif list.length == 1
                if list[0]['name'] != name
                  prompt_yn "Plugin '#{name}' was not found, but '#{list[0]['name']}' was. Install it instead?"
                end
                install_plugin list[0]
              else
                say "No plugin was found with the name '#{name}', but the following candidates were found:"
                menu list.collect { |c| c['name'] } do |selected_name, selected_index|
                  install_plugin list[selected_index]
                end
              end
              throw :complete
            end
            say_status :aborted, message, :yellow
            return # cancel any additional plugins if this one was aborted
          end
          
          install *other_names unless other_names.empty?
        end
        
        desc "uninstall NAME", "Removes the named plugin from this application"
        long_desc "Removes the plugin with the given name from this application."
        def uninstall(name)
          catch :complete do
            message = catch :aborted do
              plugin_path = Jax.root.join("vendor/plugins/#{name}")
              if File.exist?(plugin_path.to_s)
                uninstall_plugin name, plugin_path
              else
                # see if it's a partial name
                matches = search installed_plugins, name
                throw :aborted, "Plugin '#{name}' does not seem to be installed." if matches.empty?

                if matches.length == 1 && match = matches.shift
                  prompt_yn "Plugin '#{name}' is not installed, but '#{match[0]}' was. Delete it instead?"
                  uninstall_plugin *match
                else
                  say "Plugin '#{name}' is not installed, but the following partial matches are:"
                  menu matches.keys.sort, :allow_all => true do |name,index|
                    uninstall_plugin name, matches[name]
                  end
                end
              end

              throw :complete
            end
            
            say_status :aborted, message, :yellow
          end
        end
        
        desc "push", "Pushes this plugin to the repository, making it available to other people"
        long_desc "Releases the plugin to the plugin repository. If you do not have an "   \
                  "account, you will be prompted to create one. The name of the plugin "   \
                  "must be unique."
        def push
          raise "Pushing plugins to the Jax plugin repo is not yet implemented"
        end
        
        desc "list [NAME]", "Lists all plugins, or searches for a plugin by the specified name"
        long_desc "Lists all plugins, or searches for a plugin that starts with the specified name."
        method_option :detailed, :type => :boolean, :default => false,
                      :desc => "Lists the plugins with detailed multiline descriptions."
        method_option :local, :type => :boolean, :default => false,
                      :desc => "Lists only plugins that are currently installed."
        def list(name = nil)
          if options[:local] && matching_plugins(name).empty?
            say_status :missing, "There do not seem to be any plugins installed for this application."
            return
          else
            each_plugin(name) do |plugin|
              name, description = plugin['name'], plugin['description']

              if options[:detailed]
                say name
                say "  #{description}"
                say ""
              else
                if description.length > 60
                  description = description[0...57] + "..."
                end
                say "#{name.ljust 19} #{description}"
              end
            end
          end
        end
        
        def self.source_root
          File.expand_path("templates", File.dirname(__FILE__))
        end

        protected
        def uninstall_plugin(name, plugin_path)
          run_uninstall_script plugin_path
          FileUtils.rm_rf plugin_path
          say_status :complete, "Plugin '#{name}' has been removed.", :green
        end
        
        def install_plugin(details)
          name, version = details['name'], plugin_version(details)
          plugin_dir = Jax.root.join("vendor/plugins/#{name}")
          overwrite plugin_dir

          Dir.mktmpdir do |tmp|
            tarfile = download_tgz(name, version, tmp)
            untar tarfile, plugin_dir
            run_install_script plugin_dir
          end
          
          save_manifest plugin_dir, details
          
          say_status :installed, "#{plugin_dir} -v=#{version}", :green
        end
        
        def save_manifest(plugin_dir, details)
          File.open(File.join(plugin_dir, "manifest.yml"), "w") do |f|
            f.print details.to_yaml
          end
        end
        
        def run_uninstall_script(plugin_dir)
          run_script plugin_dir, "uninstall.rb"
        end
        
        def run_script(plugin_dir, script_filename)
          script = File.join(plugin_dir, script_filename)
          load script if File.exist? script
        end
        
        def run_install_script(plugin_dir)
          run_script plugin_dir, "install.rb"
        end
        
        def untar(tarfile, destination)
          tgz = Zlib::GzipReader.new(File.open(tarfile, "rb"))
          Archive::Tar::Minitar.unpack(tgz, destination.to_s) # closes tgz
        end

        def download_tgz(name, version, destdir)
          filename = "#{name}-#{version}.tgz"
          tgz = rest_resource("plugins/#{name}.tgz").get(:params => { :version => version })
          tarfile = File.join destdir, filename
          File.open(tarfile, "wb") { |f| f.print tgz }
          tarfile
        end
        
        class << self
          def basename
            "jax plugin"
          end
        end
      end
    end
  end
end
