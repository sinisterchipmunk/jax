require 'active_support/core_ext'
require 'rails/initializable'

class Jax::Plugin < Jax::Engine
  attr_reader :relative_path
  
  def initialize(path)
    super()
    @relative_path = path
  end
  
  def full_path
    File.expand_path(relative_path, Jax.root)
  end
  
  def name
    File.basename(relative_path)
  end
end
