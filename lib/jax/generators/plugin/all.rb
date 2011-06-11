module Jax
  module Generators
    module Plugin
      def rest_resource(name, accept = :xml)
        url = Jax.plugin_repository_url
        url.concat "/" unless url =~ /\/$/
        url.concat name
        RestClient::Resource.new(url, :accept => accept)
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
    end
  end
end

require File.join(File.dirname(__FILE__), "plugin_generator")
require File.join(File.dirname(__FILE__), "plugin_manager")
