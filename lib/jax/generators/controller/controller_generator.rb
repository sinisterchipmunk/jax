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

        def source
          template 'controller_source.js.tt', File.join("app/controllers", "#{file_name}_controller.js")
        end
        
        def helper
          template 'helper.js.tt', File.join("app/helpers", "#{file_name}_helper.js")
        end
        
        def test
          template 'test.js.tt', File.join('spec/javascripts/controllers', "#{file_name}_controller_spec.js")
        end

        protected
        def self.banner
          "jax generate controller #{self.arguments.map { |a| a.usage }.join(' ')}"
        end

        def file_name
          controller_name.underscore
        end
        
        def class_name
          controller_name.camelize
        end
      end
    end
  end
end
