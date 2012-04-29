# The bin command 'jax' loads this file, and this file searches for and loads
# either 'script/rails' or 'script/jax'. If neither are found, this isn't a
# Rails or Jax app and it tells the user as much.

module Jax
  module ScriptLoader
    class << self
      def invoke!
        @rails_or_jax = recursively_find_path("script/rails") || recursively_find_path("script/jax")
        
        if @rails_or_jax
          if ARGV[0] && ARGV[0][/^(g|generate|destroy)$/]
            if ARGV.length > 1
              ARGV[1] = "jax:#{ARGV[1]}"
            else
              ARGV[1] = "jax"
            end
          end
          
          return if check_for_common_commands
          ruby @rails_or_jax, *ARGV
        end

        if ARGV.shift == 'new'
          require 'generators/jax/all'
          return Jax::Generators::ApplicationGenerator.start
        end
        
        friendly_help_message
      end
      
      # if necessary, invoke a command common to both Rails and non-Rails apps
      # returns true if a command was invoked
      def check_for_common_commands
        case ARGV[0].to_s.downcase
          when 'plugin'
            require File.expand_path("../config/environment", File.dirname(@rails_or_jax))
            require 'jax'
            Jax::PluginManager.start ARGV[1..-1]
            true
          else
            false
        end
      end

      def friendly_help_message
        puts "Not in a Jax or Rails application."
        puts "Try `jax new [app-name]` or `rails new [app-name]` instead."
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
        exec *[ ruby, *args ]
      end
    end
  end
end
