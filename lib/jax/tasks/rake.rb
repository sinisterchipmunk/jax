require 'rake'
require 'jasmine'

include FileUtils

module Jasmine
  class RunAdapter
    alias _run run
    #noinspection RubyUnusedLocalVariable
    def run(focused_suite = nil)
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
  
  task :gather_resources do
    Jax::ResourceCompiler.new.save(Jax.root.join 'tmp/resources.js')
  end
end

# make jasmine call gather_resources first, so that resources can be tested
task :jasmine => 'jax:gather_resources'
