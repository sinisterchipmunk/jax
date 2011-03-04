require File.join(File.dirname(__FILE__), "../lib/jax")

Dir[File.join(File.dirname(__FILE__), 'support/**/*.rb')].each do |fi|
  require fi
end

RSpec.configure do |config|
  config.include FileExistMatcher
end
