require 'active_support/core_ext'
require 'rbconfig'
require File.join(File.dirname(__FILE__), "../../../jax")

module Jax
  module Generators
    module App
      class AppGenerator < Thor::Group
        include Thor::Actions
        argument :path_to_app

        def self.source_root
          File.expand_path("templates", File.dirname(__FILE__))
        end

        def create_root
          self.destination_root = File.expand_path(path_to_app, destination_root)
          empty_directory '.'
          FileUtils.cd destination_root
        end

        def app
          directory 'app'
        end

        def config
          directory 'config'
        end

        def public
          directory 'public'
        end

        def spec
          directory 'spec'
        end
        
        def rakefile
          copy_file 'Rakefile'
        end
        
        def script_jax
          copy_file "script/jax", "script/jax"
        end
        
        def script_permissions
          chmod("script/jax", 0755)
        end
        
        def gemfile
          if ENV['gemdev']
            create_file "Gemfile", "gem 'jax', :path => '../'"
          else
            template 'Gemfile.tt', 'Gemfile'
          end
        end
        
        def git
          void = RbConfig::CONFIG['host_os'] =~ /msdos|mswin|djgpp|mingw/ ? 'NUL' : '/dev/null'
          if system "git --version >>#{void} 2>&1"
            if File.exist? '.git'
              say_status :exist, 'git', :blue
            else
              `git init`
              `git add *`
              say_status :init, 'git', :green
            end
          else
            say_status :warn, "Git does not seem to be installed. Skipping...", :yellow
          end
        end
        
        def done
          # to clarify that everything is fine, just in case the user got warnings about git
          say_status :complete, "Done!", :green
        end

        protected
        def self.banner
          "jax new #{self.arguments.map { |a| a.usage }.join(' ')}"
        end
        
        def class_name
          path_to_app.gsub(/\-/, '_').camelize
        end
      end
    end
  end
end
