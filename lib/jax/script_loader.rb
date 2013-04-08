# The bin command 'jax' loads this file, and this file searches for and loads
# either 'script/rails' or 'script/jax'. If neither are found, this isn't a
# Rails or Jax app and it tells the user as much.

module Jax
  module ScriptLoader
    JAX_PATHS = ['script/jax', 'bin/jax']
    RAILS_PATHS = ['script/rails', 'bin/rails']

    class << self
      def invoke!
        @rails_or_jax = recursively_find_path(RAILS_PATHS + JAX_PATHS)
        
        if @rails_or_jax
          if ARGV[0]
            if ARGV[0][/^(g|generate|destroy)$/i]
              if ARGV.length > 1
                ARGV[1] = "jax:#{ARGV[1]}"
              else
                ARGV[1] = "jax"
              end
            elsif ARGV[0][/^install$/i]
              # Special case: convert `jax install` into `rails generate jax:install`
              ARGV[0] = 'generate'
              ARGV[1] = 'jax:install'
            end
          end
          
          ruby @rails_or_jax, *ARGV
        end

        if ARGV.shift == 'new'
          require 'generators/jax/all'
          return Jax::Generators::ApplicationGenerator.start
        end
        
        friendly_help_message
      end

      def friendly_help_message
        puts "Not in a Jax or Rails application."
        puts "Try `jax new [app-name]` or `rails new [app-name]` instead."
      end
      
      def recursively_find_path(relative_paths, path = File.expand_path("."))
        relative_paths.each do |relative_path|
          full_path = File.join(path, relative_path)
          return full_path if File.file?(full_path)
        end

        new_path = File.dirname(path)
        return false if new_path == path # root
        recursively_find_path relative_paths, new_path
      end

      def ruby(*args)
        ruby = File.join(*RbConfig::CONFIG.values_at("bindir", "ruby_install_name")) + RbConfig::CONFIG["EXEEXT"]
        exec *[ ruby, *args ]
      end
    end
  end
end
