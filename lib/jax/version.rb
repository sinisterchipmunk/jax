module Jax
  module Version
    MAJOR = 3
    MINOR = 0
    PATCH = 0
    BUILD = "rc1"
    STRING = BUILD ? [MAJOR, MINOR, PATCH, BUILD].join(".") : [MAJOR, MINOR, PATCH].join(".")
  end
  
  VERSION = Jax::Version::STRING
end
