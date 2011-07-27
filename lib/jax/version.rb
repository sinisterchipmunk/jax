module Jax
  module Version
    MAJOR  = 1
    MINOR  = 1
    TINY   = 0
    PREREL = "rc1"

    STRING = PREREL ? "#{MAJOR}.#{MINOR}.#{TINY}.#{PREREL}" : "#{MAJOR}.#{MINOR}.#{TINY}"
  end

  VERSION = Version::STRING
end
