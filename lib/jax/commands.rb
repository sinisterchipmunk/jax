module Jax
  module Commands
    class << self
      COMMANDS = [ 'server', 'generate' ]
      
      def invoke!
        @rails_or_jax = recursively_find_path("script/rails") || recursively_find_path("script/jax")
        if @rails_or_jax
          return run *ARGV
        end

        friendly_help_message
      end

      def command?(name)
        COMMANDS.include?(name)
      end
      
      def friendly_help_message
        puts "Not in a Jax or Rails application."
        puts "Try `jax new [app-name]` or `rails new [app-name]` instead."
      end
      
      def run(name = nil, *args)
        case name
          when 'server'
            require 'jax'
            require 'jax/rails/application'
            require 'jax/server'

            Jax::Rails::Application.initialize!
            app = Jax::Server.new(*args)
            app.start
          when 'g', 'generate'
            if @rails_or_jax =~ /\/rails$/
              if args.length > 0
                ruby @rails_or_jax, "generate", "jax:#{args.shift}", *args
              else
                ruby @rails_or_jax, "generate", "jax"
              end
            else
              require 'active_support/core_ext'
              require 'rails/generators'
              def (Rails::Generators::Base).banner
                "jax generate #{namespace.sub(/^jax:/,'')} #{self.arguments.map{ |a| a.usage }.join(' ')} [options]".gsub(/\s+/, ' ')
              end
              if args.length > 0
                Rails::Generators.invoke "jax:#{args.shift}", args
              else
                Rails::Generators.invoke "jax", args
              end
            end
          when NilClass
            usage
          else
            raise "Unrecognized command: #{name.inspect}"
        end
      end
      
      def usage
        puts "Usage:\n"
        puts "  jax server"
        puts "  jax generate GENERATOR_NAME"
        puts
      end
      
      def recursively_find_path(relative_path, path = File.expand_path("."))
        full_path = File.join(path, relative_path)
        if File.file?(full_path)
          full_path
        else
          new_path = File.dirname(path)
          return false if new_path == path # root
          recursively_find_path relative_path, new_path
        end
      end

      def ruby(*args)
        ruby = File.join(*RbConfig::CONFIG.values_at("bindir", "ruby_install_name")) + RbConfig::CONFIG["EXEEXT"]
        exec [ ruby, *args ].join(" ")
      end

    end
  end
end
