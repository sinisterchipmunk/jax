class Jax::SuiteController < ActionController::Base
  layout 'jax'
  helper_method :webgl_start
  
  private
  def webgl_start
    Jax.config.webgl_start
  end
end
