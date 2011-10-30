module Jax
  class Configuration
    attr_accessor :webgl_start

    def specs
      @specs ||= begin
        specs = Sprockets::Environment.new
        specs.append_path ::Rails.root.join("spec").to_s
        specs.append_path File.expand_path("../../spec/javascripts/helpers", File.dirname(__FILE__))
        
        # make all assets available to specs so they can //=require them as needed
        ::Rails.application.config.assets.paths.each do |path|
          specs.append_path path
        end
        
        specs
      end
    end
    
    def initialize
      @webgl_start = { :controller => "jax/suite", :action => "run_webgl" }
    end
  end
end
