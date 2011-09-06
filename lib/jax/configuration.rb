module Jax
  class Configuration
    attr_accessor :webgl_start
    
    def initialize
      @webgl_start = { :controller => "jax/suite", :action => "run_webgl" }
    end
  end
end
