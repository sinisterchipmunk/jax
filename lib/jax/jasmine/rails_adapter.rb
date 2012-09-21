require 'jasmine/application'
require 'pp'

class Jax::Jasmine::RailsAdapter
  attr_reader :rails

  def initialize(rails)
    @rails = rails
  end

  def call(env)
    middleware.call env
  end

  def middleware
    rails = self.rails

    config = Jax::Jasmine::Config.new

    redirect_paths = [
      '/run.html',
      '/__suite__',
      '/__JASMINE_ROOT__',
      config.root_path
    ]

    Rack::Builder.app do
      # use Rack::Head
      # use Rack::Jasmine::CacheControl
      # Jasmine likes to redirect back to root and has no options
      # to override this behavior, so we need to catch those redirs
      # explicitly.

      redirect_paths.each do |path|
        map(path) do
          run Proc.new { |env|
            path = File.join "/jasmine", env['REQUEST_PATH']
            Rack::Jasmine::Redirect.new(path).call env
          }
        end
      end

      # give a custom spec root so that we can pass them into Sprockets
      map config.spec_path do
        run Jax.config.specs
      end

      map '/jasmine' do
        run Jasmine::Application.app(Jasmine::RunnerConfig.new(config))
      end

      map '/' do
        run rails
      end
    end
  end
end
