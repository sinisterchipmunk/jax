require 'active_support/core_ext'

module Jax
  class Routes
    def map(*args, &block)
      if block_given?
        instance_eval &block
      else
        if !args.empty?
          @map ||= []
          case args.length
            when 1 then args.push(args[0], "index")
            when 2 then args.push("index")
            when 3 then ;
            else raise ArgumentError, "expected #map(path, controller_name[, action_name]), got #{args.inspect}"
          end
          @map << args
        end
      end
      @map.uniq!
      @map
    end
    
    def compile(outfile)
      if root
        outfile.puts "Jax.routes.root(#{controller_name_for(root[0])}, #{root[1].inspect});"
      end
      map && map.each do |set|
        path = set[0]
        args = set[2..-1].collect { |s| s.inspect }.join(",")
        
        outfile.puts "Jax.routes.map(#{path.inspect}, #{controller_name_for(set[1])}, #{args});"
      end
    end
    
    def root(controller = nil, action = 'index')
      if controller
        @root = [controller, action]
      end
      @root
    end
    
    def reload!
      load File.join(Jax.root, "config/routes.rb")
    end
    
    private
    def controller_name_for(str)
      ctrlr = str.to_s.camelize
      ctrlr.sub! /^(.*)?::.*$/, '\1'
      ctrlr = "#{ctrlr}Controller" unless ctrlr['Controller']
      ctrlr
    end
    
    class << self
      def load!
        @loaded = true
        require File.join(Jax.root, "config/routes.rb")
      end
    end
  end
end