class Jax::SuiteController < ActionController::Base
  layout :layout

  def index
  end
  
  def jasmine
    @specs = helpers + specs
  end
  
  def spec
    render :text => File.read(Rails.root.join("spec", params[:id]).to_s)
  end
  
  private
  def helpers
    localized_glob("spec/javascripts/**/*{{s,S}pec,{t,T}est}.js")
  end
  
  def specs
    localized_glob("spec/javascripts/**/*_helper.js")
  end
  
  def localized_glob(glob)
    Dir[Rails.root.join(glob).to_s].collect do |base|
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
