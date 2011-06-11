require 'active_support/core_ext'
require 'rest_client'
require 'jax'
require 'archive/tar/minitar'

module Jax
  module Generators
    module Plugin
      class PluginManager < Thor
        class ResponseError < StandardError
          def initialize(message)
            super("#{message} Make sure your firewall isn't injecting invalid responses.")
          end
        end
        
        include Thor::Actions
        
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
                  menu matches.keys, :allow_all => true do |name,index|
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
                  "must be unique; if another plugin with a matching name is found, this " \
                  "plugin will be rejected unless you own the existing plugin."
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
        def prompt_yn(message, options = {})
          yn = ask(message).downcase[0]
          throw :aborted, "Aborted by user." if yn != ?y
        end
        
        def menu(items, options = {})
          min = 1
          if options[:allow_all]
            say_option 0, "All candidates"
            min = 0
          end
          
          items.each_with_index do |item, index|
            say_option index+1, item
          end
          which = menu_choice(:min => min, :max => items.length)
                          
          if which == -1
            items.each_with_index { |item, index| yield item, index }
          else
            yield items[which], which
          end
        end
        
        def search(plugin_list, query)
          plugin_list.select { |plugin, path_to_plugin|
            !query || plugin =~ search_query_rx(query)
          }.inject({}) do |hash, (plugin, path_to_plugin)|
            hash[plugin] = path_to_plugin
            hash
          end
        end
        
        def menu_choice(*args)
          options = args.extract_options!
          caption, addl_caption = *args
          caption = "Please select an option, or press ctrl+c to cancel >" unless caption
          
          which = ask("#{addl_caption}#{caption}")
          sel = which.to_i
          # if sel.to_s != which then which is non-numeric
          if sel.to_s != which || options[:min] && sel < options[:min] || options[:max] && sel > options[:max]
            menu_choice(caption, "Invalid choice. ")
          else
            sel - 1
          end
        end
        
        def say_option(which, caption)
          say "\t#{which}\t: #{caption}"
        end
        
        def installed_plugins
          plugins = []
          Dir.glob(Jax.root.join("vendor/plugins/*").to_s).each do |path|
            if File.directory? path
              plugins.push [File.basename(path), Pathname.new(path)]
            end
          end
          plugins.sort { |a, b| a[0] <=> b[0] }
        end
        
        def search_query_rx(query)
          /^#{Regexp::escape query}/i
        end
        
        def installed_plugin_manifests(filter_name = nil)
          { 'jax_plugins' => search(installed_plugins, filter_name).collect do |name, path|
              load_or_infer_manifest(name, path)
            end
          }
        end
        
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
        
        def load_or_infer_manifest(name, plugin_dir)
          if File.file?(manifest_path = File.join(plugin_dir, "manifest.yml"))
            YAML::load(File.read(manifest_path)) || { 'name' => name, 'description' => '(Description unavailable)' }
          else
            { 'name' => name, 'description' => '(Manifest file not found!)' }
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
        
        def overwrite(path)
          path = path.to_s
          if File.exist? path
            prompt_yn "Path '#{path}' already exists! Delete it?"
            FileUtils.rm_rf path
          end
        end
        
        def download_tgz(name, version, destdir)
          filename = "#{name}-#{version}.tgz"
          tgz = rest_resource("plugins/#{name}.tgz").get(:params => { :version => version })
          tarfile = File.join destdir, filename
          File.open(tarfile, "wb") { |f| f.print tgz }
          tarfile
        end
        
        def matching_plugins(name = nil)
          if options[:local]
            hash = installed_plugin_manifests(name)
          else
            hash = get_remote_plugins_matching name
          end
          
          if list = hash['jax_plugins']
            list
          else
            raise ResponseError.new("Fatal: couldn't find plugin list.")
          end
        end
        
        def get_remote_plugins_matching(name = nil)
          plugins = rest_resource("plugins")
          if name
            extract_hash_from_response plugins[name].get
          else
            extract_hash_from_response plugins.get
          end
        end
        
        def extract_hash_from_response(response)
          begin
            hash = Hash.from_xml(response)
          rescue
            raise ResponseError.new("Fatal: response couldn't be parsed. (Maybe it wasn't valid XML?)")
          end
        end
        
        def each_plugin(name = nil, &block)
          matching_plugins(name).each &block
        end
        
        def plugin_version(details)
          if options['version']
            for release in details['releases']
              if release['version'] && release['version'] == options['version']
                return options['version']
              end
            end
            raise "Release information for version #{options['version']} not found for plugin '#{details['name']}'!"
          else
            if release = details['releases'].last and release['version']
              return release['version']
            end
            raise "Release information not found for plugin '#{details['name']}'!"
          end
        end
        
        class << self
          def basename
            "jax plugin"
          end
        end

        private
        def rest_resource(name, accept = :xml)
          url = Jax.plugin_repository_url
          url.concat "/" unless url =~ /\/$/
          url.concat name
          RestClient::Resource.new(url, :accept => accept)
        end
      end
    end
  end
end
