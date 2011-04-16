require 'active_support/core_ext'
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

        def jasmine
          say_status :init, 'jasmine', :green
          `jasmine init`
        end
        
        def jax_spec_helper
          copy_file "spec/javascripts/helpers/jax_spec_helper.js", "spec/javascripts/helpers/jax_spec_helper.js"
        end
        
        def rakefile
          insert_into_file 'Rakefile', File.read(File.expand_path("../templates/Rakefile", __FILE__)), :before => /\A/
        end
        
        def jasmine_yml
          source_files = %w(
            public/javascripts/jax
            app/**/*
            tmp/**/*
          )
          source = source_files.collect { |s| "    - #{s}.js" }.join("\n")
          insert_into_file 'spec/javascripts/support/jasmine.yml', source+"\n", :after => /^src_files\:\n/
          
          insert_into_file 'spec/javascripts/support/jasmine.yml', "    - helpers/**/*.js",
                           :after => /^helpers\:\n/
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
        
        def spec_layout
          copy_file "spec/javascripts/support/spec_layout.html.erb"
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
        
        def class_name
          path_to_app.gsub(/\-/, '_').camelize
        end
      end
    end
  end
end
