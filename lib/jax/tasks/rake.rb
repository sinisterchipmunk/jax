require 'rake'
require 'jasmine'

include FileUtils

module Jasmine
  class RunAdapter
    alias _run run
    #noinspection RubyUnusedLocalVariable
    def run(focused_suite = nil)
      # regenerate volatile files
      Rake::Task['jax:generated_files'].execute
      
      custom_file = Jax.root.join("spec/javascripts/support/spec_layout.html.erb")
      return _run(focused_suite) if !File.file?(custom_file)
      
      # overridden method so that we can use a custom html file
      jasmine_files = @jasmine_files
      css_files = @jasmine_stylesheets + (@config.css_files || [])
      js_files = @config.js_files(focused_suite)
      body = ERB.new(File.read(custom_file)).result(binding)
      [
        200,
        { 'Content-Type' => 'text/html' },
        [body]
      ]
    end
  end
end

namespace :jax do
  desc "Generate a standalone Web app"
  task :package do
    Jax::Packager.invoke
  end
  
  desc "Upgrade the Jax javascript libraries to the latest version"
  task :update do
    FileUtils.cp File.join(File.dirname(__FILE__), "../../../lib/jax/generators/app/templates/public/javascripts/jax.js"),
                 File.join(Jax.root, 'public/javascripts/jax.js')
  end
  
  task :generated_files do
    # resources
    Jax::ResourceCompiler.new.save(Jax.root.join 'tmp/resources.js')
    
    # routes
    Jax.application.config.routes.reload!
    File.open(Jax.root.join("tmp/routes.js"), 'w') do |f|
      Jax.application.config.routes.compile(f)
    end
  end
end

# make jasmine call gather_resources first, so that resources can be tested
task :jasmine => 'jax:generated_files'
