module Jax
  module Version
    MAJOR, MINOR, TINY, REL = 3, 0, 0, 'rc3'
    STRING = [MAJOR, MINOR, TINY, REL].compact.join('.')
  end

  VERSION = Version::STRING
end
