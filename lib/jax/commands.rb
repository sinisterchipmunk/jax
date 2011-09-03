module Jax
  module Commands
    class << self
      COMMANDS = [ 'server' ]
      
      def command?(name)
        COMMANDS.include?(name)
      end
      
      def run(name, *args)
        case name
          when 'server'
            require 'jax'
            require 'jax/rails/application'
            require 'jax/server'

            Jax::Rails::Application.initialize!
            app = Jax::Server.new
            app.start
        end
      end
    end
  end
end
