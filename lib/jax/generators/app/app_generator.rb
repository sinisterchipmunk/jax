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

        def jasmine
          say_status :init, 'jasmine', :green
          `jasmine init`
        end

        def rakefile
          insert_into_file 'Rakefile', "require 'rubygems'\nrequire 'jax/rake_tasks'", :before => /\A/
        end
        
        def script_jax
          copy_file "script/jax", "script/jax"
        end

        def git
          if File.exist? '.git'
            say_status :exist, 'git', :blue
          else
            `git init`
            `git add *`
            say_status :init, 'git', :green
          end
        end

        protected
        def self.banner
          "jax new #{self.arguments.map { |a| a.usage }.join(' ')}"
        end
      end
    end
  end
end
