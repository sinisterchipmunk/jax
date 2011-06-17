# Extended by classes intended to test Jax booting from an uninitialized state

require 'fileutils'
require 'rubygems'
require 'test/unit'
require 'active_support/testing/isolation'
require 'active_support/testing/declarative'

module TestHelpers
  module Paths
    module_function
    
    TMP_PATH = File.expand_path('../../../tmp', File.dirname(__FILE__))
    
    def tmp_path(*args)
      File.join TMP_PATH, *args
    end
    
    def app_path(*args)
      tmp_path *(%w[app]+args)
    end
    
    def jax_root
      app_path
    end

    def abs(relative)
      File.join(app_path, relative)
    end
  end
  
  module Generation
    def build_app(options = {})
      FileUtils.rm_rf app_path
      FileUtils.cp_r tmp_path('app_template'), app_path
      unless options[:gemfile]
        File.delete "#{app_path}/Gemfile"
      end
    end
    
    class Bukkit
      attr_reader :path
      
      def initialize(path)
        @path = path
      end
      
      def write(file, string)
        path = "#{@path}/#{file}"
        FileUtils.mkdir_p File.dirname(path)
        File.open(path, 'w') { |f| f.puts string }
      end
      
      def delete(file)
        File.delete "#{@path}/file"
      end
    end
    
    def plugin(name, string = "")
      dir = "#{app_path}/vendor/plugins/#{name}"
      FileUtils.mkdir_p dir
      File.open "#{dir}/init.rb", "w" do |f|
        f.puts "::#{name.upcase} = 'loaded'"
        f.puts string
      end
      routes = File.expand_path("../../../../lib/jax/generators/plugin/templates/new_plugin/config/routes.rb", __FILE__)
      destination = File.join(app_path, "vendor/plugins", name, "config")
      FileUtils.mkdir_p destination
      FileUtils.cp routes, File.join(destination, "routes.rb")
      Bukkit.new(dir).tap do |bukkit|
        yield bukkit if block_given?
      end
    end
    
    def engine(name)
      dir = "#{app_path}/random/#{name}"
      FileUtils.mkdir_p dir
      app = File.readlines("#{app_path}/config/application.rb")
      app.insert 2, "$:.unshift(\"#{dir}/lib\")"
      app.insert 3, "require #{name.inspect}"
      
      File.open("#{app_path}/config/application.rb", "r+") do |f|
        f.puts app
      end
      
      Bukkit.new(dir).tap do |bukkit|
        yield bukkit if block_given?
      end
    end
    
    def add_to_config(str)
      environment = File.read("#{app_path}/config/application.rb")
      if environment =~ /(\n\s*end\s*)\Z/
        File.open("#{app_path}/config/application.rb", "w") do |f|
          f.puts $` + "\n#{str}\n" + $1
        end
      else
        raise "Bug: regexp not matched"
      end
    end
    
    def app_file(path, contents)
      FileUtils.mkdir_p File.dirname("#{app_path}/#{path}")
      File.open("#{app_path}/#{path}", "w") do |f|
        f.puts contents
      end
    end
    
    def controller(name, contents)
      app_file "app/controllers/#{name}_controller.js", contents
    end
    
    def load_paths
      $:.unshift File.expand_path("../../../../lib", __FILE__)
    end
    
    def boot_app
      load_paths
      require File.join(app_path, "config/environment.rb")
    end
  end
end

class IsolatedTestCase < Test::Unit::TestCase
  include TestHelpers::Paths
  include TestHelpers::Generation
  include ActiveSupport::Testing::Isolation unless ENV['DO_NOT_ISOLATE']
  extend ActiveSupport::Testing::Declarative
  
  def default_test
    # so that empty test classes like this one don't fail
  end
end

# create a scope and build a fixture jax app
Module.new do
  extend TestHelpers::Paths
  # build a jax app
  if File.exist?(tmp_path)
    FileUtils.rm_rf tmp_path
  end
  FileUtils.mkdir_p tmp_path
  
  `#{Gem.ruby} #{File.expand_path '../../../bin/jax', File.dirname(__FILE__)} new #{tmp_path('app_template')}`
end
