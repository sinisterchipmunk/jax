require File.expand_path("plugin_manifest", File.dirname(__FILE__))
require File.expand_path("plugin_credentials", File.dirname(__FILE__))

module Jax::Generators::PluginBase
  class ResponseError < StandardError
    def initialize(message)
      super("#{message} Make sure your firewall isn't injecting invalid responses.")
    end
  end
  
  def rest_resource(name, accept = :xml)
    url = Jax.config.plugin_repository_url
    url.concat "/" unless url =~ /\/$/
    url.concat name
    RestClient::Resource.new(url, :accept => accept)
  end
  
  def search_query_rx(query)
    /^#{Regexp::escape query}/i
  end
  
  def search(plugin_list, query)
    plugin_list.select { |plugin, path_to_plugin|
      !query || plugin =~ search_query_rx(query)
    }.inject({}) do |hash, (plugin, path_to_plugin)|
      hash[plugin] = path_to_plugin
      hash
    end
  end
  
  def installed_plugins
    plugins = []
    Dir.glob(::Rails.application.root.join("vendor/plugins/*").to_s).each do |path|
      if File.directory? path
        plugins.push [File.basename(path), Pathname.new(path)]
      end
    end
    plugins.sort { |a, b| a[0] <=> b[0] }
  end
  
  def load_or_infer_manifest(name, plugin_dir)
    if File.file?(manifest_path = File.join(plugin_dir, "manifest.yml"))
      YAML::load(File.read(manifest_path)) || { 'name' => name, 'description' => '(Description unavailable)' }
    else
      { 'name' => name, 'description' => '(Manifest file not found!)' }
    end
  end
  
  def installed_plugin_manifests(filter_name = nil)
    { 'jax_plugins' => search(installed_plugins, filter_name).collect do |name, path|
        load_or_infer_manifest(name, path)
      end
    }
  end
  
  def matching_plugins(name = nil)
    if options[:local]
      hash = installed_plugin_manifests(name)
    else
      hash = get_remote_plugins_matching name
    end
    
    find_plugin_list(hash)
  end
  
  def find_plugin_list(hash_containing_plugin_list)
    hash_containing_plugin_list['jax_plugins'] ||
    hash_containing_plugin_list['nil_classes'] ||
    raise(ResponseError.new("Fatal: couldn't find plugin list."))
  end
  
  def get_remote_plugins_matching(name = nil)
    plugins = rest_resource("plugins")
    if name
      extract_hash_from_response plugins['search'][name].get
    else
      extract_hash_from_response plugins.get
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
  
  def extract_hash_from_response(response)
    begin
      hash = Hash.from_xml(response)
    rescue
      raise ResponseError.new("Fatal: response couldn't be parsed. (Maybe it wasn't valid XML?)")
    end
  end
end
