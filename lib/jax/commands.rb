# Required by script/jax in a Jax (non-Rails) project.
require 'jax'

module Jax
  module Commands
    class << self
      def invoke!(*args)
        case command = args.shift
          when 'g', 'generate'
            require 'active_support/core_ext'
            require 'rails/generators'
            def (Rails::Generators::Base).banner
             "jax generate #{namespace.sub(/^jax:/,'')} #{self.arguments.map{ |a| a.usage }.join(' ')} [options]".gsub(/\s+/, ' ')
            end

            Rails::Generators.invoke args.shift, args
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

