require 'rails/commands/server'

module Jax
  # The server is just a bare-bones Rails application built into the Jax gem.
  # It mounts Jax::Engine at the root path.
  #
  # The server can be run from any non-Rails Jax application by simply executing
  # the `jax server` command.
  #
  # Note: in a Rails app, you should simply mount Jax::Engine directly in your
  # `config/routes.rb` file:
  #
  #   Rails.application.routes.draw do
  #     mount Jax::Engine => "/jax" if Rails.env != "production"
  #   end
  #
  # The above example will mount the Jax development suite in development and
  # test modes, but not in production mode. Usually, you won't want to expose
  # Jax::Engine to a production environment, but of course this is up to you.
  #
  # Note that you only need to mount Jax::Engine if you want to use the development
  # suite. You get the Jax assets (e.g. the Jax JavaScript API) for free when you
  # add Jax to your Gemfile.
  #
  # TODO make `jax server` runnable from Rails apps.
  #
  class Server < ::Rails::Server
    class Options
      def parse!(args)
        args, options = args.dup, {}

        opt_parser = OptionParser.new do |opts|
          opts.banner = "Usage: jax server [mongrel, thin, etc] [options]"
          opts.on("-p", "--port=port", Integer,
                  "Runs Jax on the specified port.", "Default: 3000") { |v| options[:Port] = v }
          opts.on("-b", "--binding=ip", String,
                  "Binds Jax to the specified ip.", "Default: 0.0.0.0") { |v| options[:Host] = v }
          opts.on("-c", "--config=file", String,
                  "Use custom rackup configuration file") { |v| options[:config] = v }
          opts.on("-d", "--daemon", "Make server run as a Daemon.") { options[:daemonize] = true }
          opts.on("-u", "--debugger", "Enable ruby-debugging for the server.") { options[:debugger] = true }
          opts.on("-e", "--environment=name", String,
                  "Specifies the environment to run this server under (test/development/production).",
                  "Default: development") { |v| options[:environment] = v }
          opts.on("-P","--pid=pid",String,
                  "Specifies the PID file.",
                  "Default: tmp/pids/server.pid") { |v| options[:pid] = v }
          opts.on('-q','--quiet',"Does not tail the log file.") { |v| options[:quiet] = true }

          opts.separator ""

          opts.on("-h", "--help", "Show this help message.") { puts opts; exit }
        end

        opt_parser.parse! args
        options[:server] = args.shift

        options
      end
    end
        

    attr_reader :args
    
    def opt_parser
      Options.new
    end
        
    def initialize(*args)
      @args = args
      super()
    end
    
    def middleware
      middlewares = []
      middlewares << [::Rails::Rack::LogTailer, log_path] unless options[:daemonize] || options[:quiet]
      middlewares << [::Rails::Rack::Debugger]  if options[:debugger]
      middlewares << [::Rack::ContentLength]
      Hash.new(middlewares)
    end
            
    def options
      @options ||= parse_options(args)
    end
  end
end
