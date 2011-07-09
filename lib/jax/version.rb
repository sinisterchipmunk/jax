module Jax
  module Version
    MAJOR = 1
    MINOR = 1
    TINY  = 0
    PREREL= "rc1"

    STRING = PREREL == 0 ? "#{MAJOR}.#{MINOR}.#{TINY}" : "#{MAJOR}.#{MINOR}.#{TINY}.#{PREREL}"
  end

  VERSION = Version::STRING
end
