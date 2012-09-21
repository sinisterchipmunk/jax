class Jax::SuiteController < ActionController::Base
  layout 'jax'
  helper_method :webgl_start
  
  def index
    redirect_to :action => :run_webgl
  end
  
  private
  def webgl_start
    Jax.config.webgl_start
  end
end
