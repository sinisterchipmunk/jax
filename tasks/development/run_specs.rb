require 'rubygems'
require 'jasmine'
if Jasmine::Dependencies.rspec2?
  require 'rspec'
else
  require 'spec'
end

jasmine_yml = File.join(Dir.pwd, 'spec', 'javascripts', 'support', 'jasmine.yml')
if File.exist?(jasmine_yml)
end

Jasmine.load_configuration_from_yaml

config = Jasmine.config
config.port = 3000

require 'net/http'

# Lengthen timeout in Net::HTTP
module Net
    class HTTP
        alias old_initialize initialize

        def initialize(*args)
            old_initialize(*args)
            @read_timeout = 5*60     # 5 minutes
        end
    end
end

driver = Jasmine::SeleniumDriver.new(config.browser, "#{config.host}:#{config.port}/jasmine/")
t = Thread.new do
  begin
    require 'jax'
    require 'jax/rails/application'
    require 'shader-script'
    # moved public into spec to a) emphasize that it's for testing and b) avoid
    # conflicting with normal 'public' dirs in current or future Rails versions.
    Jax::Rails::Application.config.paths['public'] = "spec/fixtures/public"
    server = Jax::Server.new #*(ENV['quiet'] ? ["--quiet"] : [])
    server.start
  rescue ChildProcess::TimeoutError
  end
  # # ignore bad exits
end
t.abort_on_exception = true
Jasmine::wait_for_listener(config.port, "jasmine server")
puts "jasmine server started."

results_processor = Jasmine::ResultsProcessor.new(config)
results = Jasmine::Runners::HTTP.new(driver, results_processor, config.result_batch_size).run
formatter = Jasmine::RspecFormatter.new
formatter.format_results(results)
