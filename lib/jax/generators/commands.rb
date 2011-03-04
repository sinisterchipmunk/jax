module Jax
  autoload :AppGenerator, File.join(File.dirname(__FILE__), "jax/app_generator")

  COMMANDS = {
      'new' => :AppGenerator
  }
end
