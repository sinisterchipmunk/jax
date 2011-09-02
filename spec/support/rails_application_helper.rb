# require 'rspec/isolation'
require 'rack/test'
# require 'rails/all'

$rails_app = nil

module RailsApplicationHelper
  class RailsAppGenerator
    include Rack::Test::Methods
    
    def initialize(&block)
      @dir = File.expand_path("../../tmp/rails-app", File.dirname(__FILE__))

      generate_app
    end
    
    def app(env = "production")
      load! unless loaded?
      Rails.application
    end
    
    def get(path, options = { :raise_errors => true })
      env = ::Rack::MockRequest.env_for(path)
      app.call(env).tap do |response|
        def response.body
          "".tap do |body|
            self[2].each { |chunk| body << chunk }
          end
        end
        # raise sprockets errors as ruby errors or we'll never see them
        # *certainly* there's a better way??
        if options[:raise_errors]
          if response.body =~ /Error\("Sprockets/
            raise response.body
          elsif response[0] >= 400
            raise response.body
          end
        end
      end
    end
    
    def loaded?
      !!@loaded
    end
    
    def path(path)
      File.join(@dir, path)
    end
    
    def file(name)
      FileUtils.touch(path name) unless File.file?(path name)
      if block_given?
        File.open(path(name), "w+") do |f|
          yield f
        end
      end
      path name
    end
    
    def directory(name)
      FileUtils.mkdir_p(path name)
    end
    
    def load!(options = { :jax => true })
      @loaded = true
      if options[:jax]
        Jax::Generators::InstallGenerator.start([], :destination_root => @dir, :shell => TestShell.new)
      end
      load file("config/environment.rb")
    end

    private
    def generate_app
      FileUtils.mkdir_p @dir
      base = File.expand_path("../fixtures/rails-app", File.dirname(__FILE__))
      Dir[File.join(base, "**/*")].each do |src|
        dst_name = src.gsub(/^#{Regexp::escape base}\/?/, '')

        if File.directory?(src)
          directory dst_name
        else
          file dst_name do |dst|
            dst.print File.read(src)
          end
        end
      end
    end
  end
  
  def app(&block)
    $rails_app ||= RailsAppGenerator.new(&block)
  end
  
  def self.included(base)
    base.send :include, Matchers
    
    # base.instance_eval do
    #   # before(:each) { run_in_isolation }
    #   
    #   def it(*a,&b) iso_it(*a, &b) end
    # end
  end
end
