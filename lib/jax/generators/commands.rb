# This script is required by script/jax if script/jax is found.

require 'thor'
require 'thor/group'
require File.expand_path('../../jax', File.dirname(__FILE__))

module Jax
  module Generators
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
          included(base)
        end
      
        def included(base)
          base.send :extend, ClassMethods
          base.base_path = File.dirname(caller.first.gsub(/:.*$/, ''))
        end
      end
    end
    
    class Command < Thor::Group
      include Jax::Generators::Usage
    end
    
    autoload :Controller, File.join(File.dirname(__FILE__), "controller/controller_generator")
    autoload :Model,      File.join(File.dirname(__FILE__), "model/model_generator")
    autoload :LightSource,File.join(File.dirname(__FILE__), "light_source/light_source_generator")
    autoload :Material,   File.join(File.dirname(__FILE__), "material/material_generator")
    autoload :Shader,     File.join(File.dirname(__FILE__), "shader/shader_generator")
    autoload :Plugin,     File.join(File.dirname(__FILE__), "plugin/plugin_manager")
  end
end

class JaxGeneratorInvoker < Thor
  def self.basename
    "jax generate"
  end

  desc "controller", "generates a new controller"
  def controller(*args)
    Jax::Generators::Controller::ControllerGenerator.start(args)
  end
  
  desc "model", "generates a new model"
  def model(*args)
    Jax::Generators::Model::ModelGenerator.start(args)
  end
  
  desc "light", "generates a new light source"
  def light(*args)
    Jax::Generators::LightSource::LightSourceGenerator.start(args)
  end
  
  desc "material", "generates a new material"
  def material(*args)
    args = ARGV.dup
    2.times { args.shift }
    Jax::Generators::Material::MaterialGenerator.start(args)
  end

  desc "scaffold", "generates a controller, model and material, all with the same name"
  def scaffold(*name)
    name = name.shift || []
    Jax::Generators::Controller::ControllerGenerator.start([name, 'index'])
    Jax::Generators::Model::ModelGenerator.start([name])
    Jax::Generators::Material::MaterialGenerator.start([name])
  end

  desc "shader", "generates a new custom shader"
  def shader(*name)
    Jax::Generators::Shader::ShaderGenerator.start(name)
  end
end

class JaxGenerator# < Thor
  attr_reader :args, :command
  
  COMMANDS = {
    "generate" => "Generate new code",
    #"destroy"  => "Undo code generated with \"generate\"",
    "plugin"   => "Install a plugin"
  }
  ALIASES = { "g" => "generate" }
  
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
    def start
      new ARGV
    end
  end
end

