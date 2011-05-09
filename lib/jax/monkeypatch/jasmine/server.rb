module Jasmine
  class RunAdapter
    alias _run run
    # overridden method so that we can use a custom html file
    #noinspection RubyUnusedLocalVariable
    def run(focused_suite = nil)
      # regenerate volatile files
      Rake::Task['compile'].execute if $JAX_DEVELOPMENT             # rebuild jax itself if we're in gem development
      Rake::Task['jax:generate_files'].execute if !$JAX_RAKE        # rebuild the project resources, routes, etc
      
      custom_file = Jax.root && Jax.root.join("spec/javascripts/support/spec_layout.html.erb")
      return _run(focused_suite) if !custom_file || !File.file?(custom_file)
      
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
  
  # overridden so that we can map source files separately from /public
  def self.app(config)
    Rack::Builder.app do
      use Rack::Head
      
      map("/run.html")  { run Jasmine::Redirect.new('/') }
      map("/__suite__") { run Jasmine::FocusedSuite.new(config) }
      
      map("/__JASMINE_ROOT__") { run Rack::File.new(Jasmine.root) }
      map(config.spec_path) { run Rack::File.new(config.spec_dir) }
      map(config.root_path) { run Rack::File.new(config.project_root) }
      
      map '/' do
        run Rack::Cascade.new([
          Rack::URLMap.new(
            '/' => Rack::File.new(config.root_dir),
            '/__src__' => Rack::File.new(config.src_dir)
          ),
        
          Jasmine::RunAdapter.new(config)
        ])
      end
    end
  end
end
