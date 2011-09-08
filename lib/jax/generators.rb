require 'jax/commands'

module Jax
  module Generators
    class << self
      def find_script_file(name, path = File.expand_path("."))
        full_path = File.join(path, "script", name)
        if File.file?(full_path)
          full_path
        else
          new_path = File.dirname(path)
          return false if new_path == path # root
          find_script_file(name, new_path)
        end
      end
      
      def in_jax_app?
        find_script_file("jax")
      end
      
      def in_rails_app?
        find_script_file("rails")
      end
      
      def ruby(*args)
        ruby = File.join(*RbConfig::CONFIG.values_at("bindir", "ruby_install_name")) + RbConfig::CONFIG["EXEEXT"]
        exec [ ruby, *args ].join(" ")
      end
      
      def invoke!
        if Jax::Commands.command?(ARGV.first)
          Jax::Commands.run ARGV.shift, *ARGV
        else
          if script_rails = in_rails_app?
            if ARGV.length > 1
              ruby script_rails, ARGV.shift, "jax:#{ARGV.shift}", *ARGV
            else
              ruby script_rails, *ARGV
            end
          elsif script_jax = in_jax_app?
            ruby script_jax, *ARGV
          else
            invoke_app_generator
          end
        end
      end
    end
  end
end
