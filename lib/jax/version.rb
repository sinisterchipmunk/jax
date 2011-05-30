module Jax
  module Version
    MAJOR = 0
    MINOR = 0
    TINY  = 0
    PATCH = 7

    STRING = PATCH == 0 ? "#{MAJOR}.#{MINOR}.#{TINY}" : "#{MAJOR}.#{MINOR}.#{TINY}.#{PATCH}"
  end

  VERSION = Version::STRING
end
