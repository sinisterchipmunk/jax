# Required by script/jax in a Jax (non-Rails) project.
require 'jax'

module Jax
  module Commands
    class << self
      def setup_generator_invocation
        require APP_PATH
        require 'rails/generators'
        Dir.chdir(::Rails.application.root)
        
        def (::Rails::Generators::Base).banner
         "jax generate #{namespace.sub(/^jax:/,'')} #{self.arguments.map{ |a| a.usage }.join(' ')} [options]".gsub(/\s+/, ' ')
        end

        ::Rails.application.initialize!
      end
      
      def invoke_jax_generator(name, args, options = {})
        ::Rails::Generators.invoke name, args, options
      end
      
      def invoke!(*args)
        case command = args.shift
          when 'package'
            puts "The `jax package` command has been deprecated."
            puts
            puts "Please run this command instead:"
            puts
            puts "    rake assets:precompile"
            puts
          when 'g', 'generate'
            setup_generator_invocation
            invoke_jax_generator args.shift, args
          when 'destroy'
            setup_generator_invocation
            invoke_jax_generator args.shift, args, :behavior => :revoke
          when 'server'
            Jax::Server.new(*args).tap do |server|
              require APP_PATH
              Dir.chdir(::Rails.application.root)
              server.start
            end
          when NilClass # no args given
            usage
          else
            raise ArgumentError, "Command not recognized: #{command.inspect}"
        end
      end
      
      def usage
        puts "Jax version #{Jax::Version::STRING}"
        puts
        puts "Usage:"
        puts "  jax server        - start development server"
        puts "  jax generate      - list all available generators"
        puts "  jax generate NAME - invoke a generator"
        puts
      end
    end
  end
end

begin
  Jax::Commands.invoke! *ARGV
rescue ArgumentError => err
  puts err.message
end

