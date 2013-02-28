require File.expand_path("../all", File.dirname(__FILE__))

module Jax
  module Generators
    class LightGenerator < Jax::Generators::NamedBase
      argument :type
      
      def light_type
        case type
        when 'spot', 'directional', 'point'
          type.upcase + "_LIGHT"
        else
          raise "Invalid light type. Expected one of ['spot', 'directional', 'point']"
        end
      end
      
      def create_light_source
        template "light.resource.erb",
          File.join('app/assets/jax/resources/lights', "#{file_name}.resource")
      end
    end
  end
end
