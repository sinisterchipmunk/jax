require 'pathname'

if ARGV.include? '-v' or ARGV.include? '--version'
  require 'thor'
  require File.expand_path("../version", File.dirname(__FILE__))
  
  class VersionGenerator < Thor
    map "--version" => :version, "-v" => :version
    desc "--version, -v", "display the Jax version number"
    def version
      say "Jax v#{Jax::VERSION}"
    end
  end
  VersionGenerator.start(['--version'])
  exit
end


module Jax
  module Generators
    # Shamelessly lifted from Ruby on Rails
    module ScriptJaxLoader
      RUBY = File.join(*RbConfig::CONFIG.values_at("bindir", "ruby_install_name")) + RbConfig::CONFIG["EXEEXT"]
      SCRIPT_JAX = File.join('script', 'jax')
  
      def self.exec_script_jax!
        cwd = Dir.pwd
        ENV['JAX_CWD'] ||= cwd
        return unless in_jax_application? || in_jax_application_subdirectory?
        exec RUBY, SCRIPT_JAX, *ARGV if in_jax_application?
        Dir.chdir("..") do
          # Recurse in a chdir block: if the search fails we want to be sure
          # the application is generated in the original working directory.
          exec_script_jax! unless cwd == Dir.pwd
        end
      rescue SystemCallError
        # could not chdir, no problem just return
      end
  
      def self.in_jax_application?
        File.exists?(SCRIPT_JAX)
      end
  
      def self.in_jax_application_subdirectory?(path = Pathname.new(Dir.pwd))
        File.exists?(File.join(path, SCRIPT_JAX)) || !path.root? && in_jax_application_subdirectory?(path.parent)
      end
    end
  end
end