require 'active_support/core_ext'

module Jax
  module Generators
    module Controller
      class ControllerGenerator < Thor::Group
        include Thor::Actions
        argument :controller_name

        def self.source_root
          File.expand_path("templates", File.dirname(__FILE__))
        end

        def controller_source_file
          template 'controller_source.js.tt', File.join("app/controllers", "#{file_name}.js")
        end

#        def create_root
#          self.destination_root = File.expand_path(path_to_app, destination_root)
#          empty_directory '.'
#          FileUtils.cd destination_root
#        end
#
#        def app
#          directory 'app'
#        end
#
#        def config
#          directory 'config'
#        end
#
#        def public
#          directory 'public'
#        end
#
#        def jasmine
#          say_status :init, 'jasmine', :green
#          `jasmine init`
#        end
#
#        def rakefile
#          insert_into_file 'Rakefile', "require 'rubygems'\nrequire 'jax/rake_tasks'", :before => /\A/
#        end
#
#        def git
#          if File.exist? '.git'
#            say_status :exist, 'git', :blue
#          else
#            `git init`
#            `git add *`
#            say_status :init, 'git', :green
#          end
#        end

        protected
        def self.banner
          "jax generate controller #{self.arguments.map { |a| a.usage }.join(' ')}"
        end

        def file_name
          controller_name.underscore
        end
      end
    end
  end
end
