module Jax
  class Configuration
    attr_accessor :webgl_start

    def specs
      @specs ||= begin
        specs = Sprockets::Environment.new
        specs.append_path ::Rails.root.join("spec").to_s
        specs
      end
    end
    
    def initialize
      @webgl_start = { :controller => "jax/suite", :action => "run_webgl" }
    end
  end
end
