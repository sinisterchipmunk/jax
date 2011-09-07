class Jax::SuiteController < ActionController::Base
  layout :layout
  helper_method :webgl_start
  
  def webgl_start
    Jax.config.webgl_start
  end
  
  def index
  end
  
  def jasmine
    # order helpers before specs
    @specs = helpers + specs
  end
  
  def spec
    render :text => Jax.config.specs[params[:id]].to_s
  end
  
  private
  def helpers
    collect_spec_files_matching /_helper\.js$/
  end
  
  def specs
    collect_spec_files_matching /([sS]pec|[tT]est).js$/
  end
  
  def collect_spec_files_matching(pattern)
    [].tap do |files|
      Jax.config.specs.each_file do |file|
        file = Jax.config.specs.attributes_for(file).logical_path
        files << file if file =~ pattern
      end
    end
  end
  
  def layout
    case params[:action]
    when 'spec' then nil
    else 'jax'
    end
  end
end
