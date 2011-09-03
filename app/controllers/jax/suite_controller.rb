class Jax::SuiteController < ActionController::Base
  layout :layout

  def index
  end
  
  def jasmine
    @specs = helpers + specs
  end
  
  def spec
    # response.format = :js
    render :file => File.join("spec", params[:id])
  end
  
  private
  def helpers
    Dir[Rails.root.join("spec/javascripts/**/*{{s,S}pec,{t,T}est}.js").to_s].collect do |base|
      base.sub(/^#{Regexp::escape Rails.root.join('spec').to_s}\/?/, '')
    end
  end
  
  def specs
    Dir[Rails.root.join("spec/javascripts/**/*_helper.js").to_s].collect do |base|
      base.sub(/^#{Regexp::escape Rails.root.join('spec').to_s}\/?/, '')
    end
  end
  
  def layout
    case params[:action]
    when 'spec' then nil
    else 'jax'
    end
  end
end
