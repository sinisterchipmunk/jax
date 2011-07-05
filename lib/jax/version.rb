module Jax
  module Version
    MAJOR = 1
    MINOR = 0
    TINY  = 1
    PREREL= "rc1"

    STRING = PREREL == 0 ? "#{MAJOR}.#{MINOR}.#{TINY}" : "#{MAJOR}.#{MINOR}.#{TINY}.#{PREREL}"
  end

  VERSION = Version::STRING
end
