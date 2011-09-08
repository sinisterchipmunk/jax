module Jax
  module Version
    MAJOR  = 1
    MINOR  = 1
    TINY   = 1
    PREREL = nil

    STRING = PREREL ? "#{MAJOR}.#{MINOR}.#{TINY}.#{PREREL}" : "#{MAJOR}.#{MINOR}.#{TINY}"
  end

  VERSION = Version::STRING
end
