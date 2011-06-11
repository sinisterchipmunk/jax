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
                  yn = ask("Plugin '#{name}' was not found, but '#{list[0]['name']}' was. Install it instead?")
                  if yn.downcase[0] != ?y
                    throw :aborted, "Named plugin was not found. User aborted."
                  end
                end
                install_plugin list[0]
              else
                say "No plugin was found with the name '#{name}', but the following candidates were found:"
                list.each_with_index do |item, index|
                  say_option index+1, item['name']
                end
                which = menu_choice(:min => 1, :max => list.length)
                if which >= 0 && which < list.length
                  install_plugin list[which]
                else
                  throw :aborted, "Option choice was invalid. Aborting."
                end
              end
              throw :complete
            end
            say_status :aborted, message, :yellow
            return
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
                matches = []
                installed_plugins.each do |installed, path|
                  matches.push [installed, path] if installed =~ /^#{Regexp::escape name}/i
                end
                throw :aborted, "Plugin '#{name}' does not seem to be installed." if matches.empty?

                if matches.length == 1 && match = matches.shift
                  yn = ask("Plugin '#{name}' is not installed, but '#{match[0]}' was. Delete it instead?").downcase[0]
                  throw :aborted, "Aborted by user." if yn != ?y
                  uninstall_plugin *match
                else
                  say "Plugin '#{name}' is not installed, but the following partial matches were:"
                  say_option 0, "All candidates"
                  matches.each_with_index do |match, index|
                    say_option index+1, match[0]
                  end
                  which = menu_choice(:min => 0, :max => matches.length)
                
                  if which == -1
                    matches.each { |match| uninstall_plugin *match }
                  elsif which >= 0 && which < matches.length
                    uninstall_plugin *matches[which]
                  else
                    throw :aborted, "Option choice was invalid. Aborting."
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
              name = plugin['name']
              description = plugin['description']

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
        
        def installed_plugin_manifests
          { 'jax_plugins' =>
            installed_plugins.collect do |name, path|
              if File.file?(manifest_path = path.join("manifest.yml").to_s)
                YAML::load(File.read(manifest_path)) || {}
              else
                { 'name' => name, 'description' => '(Manifest file not found!)' }
              end
            end
          }
        end
        
        def uninstall_plugin(name, plugin_path)
          if File.exist?(uninstaller = plugin_path.join("uninstall.rb").to_s)
            load uninstaller
          end
          FileUtils.rm_rf plugin_path
          say_status :complete, "Plugin '#{name}' has been removed.", :green
        end
        
        def install_plugin(details)
          # download the tar
          name = details['name']
          version = plugin_version(details)
          
          tmp = Jax.root.join("tmp")
          FileUtils.mkdir_p tmp unless File.directory? tmp
          raise "Couldn't make directory '#{tmp}'!" unless File.directory? tmp
          
          tgz = rest_resource("plugins/#{name}.tgz").get(:params => { :version => version })
          filename = "#{name}-#{version}.tgz"
          tarfile = tmp.join filename
          File.open(tarfile, "wb") { |f| f.print tgz }
          tgz = Zlib::GzipReader.new(File.open(tarfile, "rb"))
          
          plugin_dir = Jax.root.join("vendor/plugins/#{name}")
          if File.exist? plugin_dir.to_s
            yn = ask("Plugin destination '#{plugin_dir}' already exists! Delete it?").downcase[0]
            throw :aborted, "Destination already exists; user aborted." if yn != ?y
            FileUtils.rm_rf plugin_dir
          end
          
          Archive::Tar::Minitar.unpack(tgz, plugin_dir.to_s) # closes tgz
          if File.exist? plugin_dir.join("install.rb").to_s
            load plugin_dir.join("install.rb").to_s
          end
          
          File.open(plugin_dir.join("manifest.yml"), "w") do |f|
            f.print details.to_yaml
          end
          say_status :installed, "#{plugin_dir} -v=#{version}", :green
        end
        
        def matching_plugins(name = nil)
          if options[:local]
            hash = installed_plugin_manifests
          else
            plugins = rest_resource("plugins")
            if name
              response = plugins[name].get
            else
              response = plugins.get
            end
            begin
              hash = Hash.from_xml(response)
            rescue
              raise ResponseError.new("Fatal: response couldn't be parsed. (Maybe it wasn't valid XML?)")
            end
          end
          
          if list = hash['jax_plugins']
            list
          else
            raise ResponseError.new("Fatal: couldn't find plugin list.")
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
