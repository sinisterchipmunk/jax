require File.expand_path("../../generators/jax/all", File.dirname(__FILE__))
require 'rest_client'

module Jax
  class PluginManager < Thor
    include Jax::Util::Tar
    include Thor::Actions
    include Jax::Generators::PluginBase
    include Jax::Generators::Actions
    
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
          plugin_path = ::Rails.application.root.join("vendor/plugins/#{name}")
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
      if destination_root =~ /^#{Regexp::escape ::Rails.application.root.join("vendor/plugins").to_s}\/?([^\/]+)(\/|$)/
        plugin_name = $1
        plugin_dir = ::Rails.application.root.join("vendor/plugins", plugin_name)
        manifest = plugin_dir.join("manifest.yml").to_s
        if File.exist? manifest
          manifest = Jax::Plugin::Manifest.find(plugin_name)
          if manifest.description.blank?
            say "Please enter a plugin description in the manifest.yml file"
          else
            publish_plugin manifest
          end
        else
          say "Plugin manifest is missing!"
          say "A default manifest file will be written. Please modify "
          say "this file before continuing."
          say ""
          Jax::Plugin::Manifest.new(plugin_name).save
          say_status :created, "manifest.yml", :green
        end
      else
        say_status :aborted, "Please run this script from within a plugin directory.", :red
      end
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
      say ""
    end
    
    def self.source_root
      File.expand_path("../../../../templates", File.dirname(__FILE__))
    end

    protected
    def publish_plugin(manifest)
      credentials = Jax::Plugin::Credentials.new(:shell => shell)
      api_key = credentials.api_key
      plugin_filename = "#{manifest.name}-#{manifest.version}.tgz"
      targz = gzip(tar ::Rails.application.root.join("vendor/plugins", manifest.name).to_s)
      
      # This is probably bad practice, but it just
      # seems so silly to create a whole new subclass
      # just for one accessor
      class << targz; attr_accessor :path; end
      targz.path = plugin_filename

      plugin = {
        :single_access_token => api_key,
        :plugin => {
          :name => manifest.name,
          :description => manifest.description,
          :version => manifest.version,
          :stream => targz
        }
      }
      
      begin
        res = Hash.from_xml(credentials.plugins.post plugin).with_indifferent_access
        if res && res[:hash] && !res[:hash][:error].blank?
          say_status :error, res[:hash][:error], :red
        else
          say_status :done, "Plugin #{plugin_filename} published", :green
        end
      rescue RestClient::RequestFailed
        res = Hash.from_xml($!.http_body)
        if error = res['hash'] && res['hash']['error']
          say_status :error, error, :red
        else
          say_status :error, "A server-side error has occurred.", :red
        end
      end
    end
    
    def uninstall_plugin(name, plugin_path)
      run_uninstall_script plugin_path
      FileUtils.rm_rf plugin_path
      say_status :complete, "Plugin '#{name}' has been removed.", :green
    end
    
    def install_plugin(details)
      name, version = details['name'], plugin_version(details)
      plugin_dir = ::Rails.application.root.join("vendor/plugins/#{name}")
      overwrite plugin_dir

      tarfile = download_tgz(name, version)
      untar ungzip(tarfile), plugin_dir
      run_install_script plugin_dir
      
      save_manifest plugin_dir, details unless File.exist?(File.join(plugin_dir, "manifest.yml"))
      
      say_status :installed, "#{plugin_dir} -v=#{version}", :green
    end
    
    def save_manifest(plugin_dir, details)
      # collect necessary details
      details = details.inject({}) do |hash,(k,v)|
        case k.to_s
        when 'name', 'description', 'version' then hash[k.to_s] = v
        when 'releases' then
          version = v.last['version']
          hash['version'] = version if hash['version'].blank? || hash['version'] < version
        end
        hash
      end
      
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
    
    def download_tgz(name, version)
      filename = "#{name}-#{version}.tgz"
      tgz = rest_resource("plugins/#{name}.tgz").get(:params => { :version => version })
      StringIO.new tgz
    end
    
    class << self
      def basename
        "jax plugin"
      end
    end
  end
end
