# This script is required by script/jax if script/jax is found.

require 'thor'
require 'thor/group'
require File.expand_path('../../jax', File.dirname(__FILE__))
require File.expand_path('interactions', File.dirname(__FILE__))

module Jax
  module Generators
    class Error < Thor::Error
    end
    
    module Usage
      module ClassMethods
        def start(given_args=ARGV, config={})
          if (given_args.length == 0)
            puts usage
          else
            super
          end
        end

        def usage
          usage = ERB.new(File.read(File.expand_path("USAGE", base_path)), nil, '-')
          usage.result(binding)
        end

        def base_path
          @base_path || raise("Jax Command base path was not found")
        end

        def base_path=(path)
          @base_path = path
        end
      end
      
      class << self
        def extended(base)
          base.send :extend, ClassMethods
          base.base_path = File.dirname(caller.first.gsub(/:.*$/, ''))
        end
      
        def included(base)
          base.send :extend, ClassMethods
          base.base_path = File.dirname(caller.first.gsub(/:.*$/, ''))
        end
      end
    end
    
    class Command < Thor::Group
      include Jax::Generators::Usage
      
      no_tasks do
        def exit(message = "")
          raise Jax::Generators::Error, message
        end
      end
      
      def self.inherited(base)
        base.base_path = File.dirname(caller.first.gsub(/:.*$/, ''))
        base.instance_eval do
          def self.source_root
            File.join(base_path, "templates")
          end
        end
      end
    end
    
    # Generators extending PluggableCommand will produce code in either a Jax
    # application proper, or in a plugin within the app.
    class PluggableCommand < Command
      def check_plugin_destination
        if ENV['JAX_CWD'] && cwd = File.expand_path('.', ENV['JAX_CWD'])
          if cwd =~ /^#{Regexp::escape File.join(Jax.root, "vendor/plugins/", "")}(.*?)(\/|$)/
            self.destination_root = Jax.root.join("vendor", "plugins", $1)
          end
        end
      end
    end
    
    autoload :Controller,  "jax/generators/controller/controller_generator"
    autoload :Model,       "jax/generators/model/model_generator"
    autoload :LightSource, "jax/generators/light_source/light_source_generator"
    autoload :Material,    "jax/generators/material/material_generator"
    autoload :Shader,      "jax/generators/shader/shader_generator"
    autoload :Plugin,      "jax/generators/plugin/all"
    autoload :Packager,    "jax/generators/packager/package_generator"
  end
end

class JaxGeneratorInvoker < Thor
  def self.basename
    "jax generate"
  end

  desc "controller NAME", "generates a new controller"
  def controller(*args)
    Jax::Generators::Controller::ControllerGenerator.start(args)
  end
  
  desc "model NAME", "generates a new model"
  def model(*args)
    Jax::Generators::Model::ModelGenerator.start(args)
  end
  
  desc "light NAME TYPE", "generates a new light source"
  def light(*args)
    Jax::Generators::LightSource::LightSourceGenerator.start(args)
  end
  
  desc "material NAME", "generates a new material"
  def material(*args)
    args = ARGV.dup
    2.times { args.shift }
    Jax::Generators::Material::MaterialGenerator.start(args)
  end

  desc "scaffold NAME", "generates a controller, model and material, all with the same name"
  def scaffold(name)
    Jax::Generators::Controller::ControllerGenerator.start([name, 'index'])
    Jax::Generators::Model::ModelGenerator.start([name])
    Jax::Generators::Material::MaterialGenerator.start([name])
  end

  desc "shader NAME", "generates a new custom shader"
  def shader(*name)
    Jax::Generators::Shader::ShaderGenerator.start(name)
  end
  
  desc "plugin NAME", "generates a new plugin"
  def plugin(*args)
    Jax::Generators::Plugin::PluginGenerator.start(ARGV[1..-1])
  end
  
  desc "package", "packages this Jax application in preparation for deployment"
  def package(*args)
    Jax::Generators::Packager::PackageGenerator.start(args)
  end
end

class JaxGenerator
  attr_reader :args
  
  COMMANDS = {
    "generate" => "Generate new code",
    #"destroy"  => "Undo code generated with \"generate\"",
    "plugin"   => "Install a plugin"
  } unless defined?(COMMANDS)
  ALIASES = { "g" => "generate" } unless defined?(ALIASES)
  
  def initialize(args)
    @args = args
    
    show_usage and return unless command
    if respond_to? command then send command
    else invalid command
    end
  rescue ArgumentError
    puts $!.message
  end
  
  def generate
    JaxGeneratorInvoker.start
  end
  
  def plugin
    Jax::Generators::Plugin::PluginManager.start
  end
  
  def command
    @command ||= begin
      command = args.shift
      command = ALIASES[command] || command
    end
  end
  
  def invalid(command)
    puts "Invalid command."
    puts
    show_usage
  end
  
  def show_usage
    puts <<-end_banner
Usage: jax COMMAND [ARGS]

The following commands are available:
  #{command_list.join("\n  ")}
  
All commands can be run with -h for more information.
    end_banner
  end
  
  def command_list
    COMMANDS.keys.collect { |command| "#{command.ljust(13)}#{description_for command}"}
  end
  
  def description_for(command)
    if i = ALIASES.values.index(command)
      COMMANDS[command] + " (shortcut alias: \"#{ALIASES.keys[i]}\")"
    else
      COMMANDS[command]
    end
  end
  
  class << self
    # this gets called by script/jax from within a jax app
    def start
      new ARGV
    end
  end
end

