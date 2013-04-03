class Jax::SuiteController < ActionController::Base
  layout 'jax'
  helper_method :webgl_start
  include ActionView::Helpers::AssetTagHelper

  def controller
    self
  end

  def specs
    respond_to do |fmt|
      fmt.json do
        assets = Rails.application.assets

        # Tempting to just concat all sources here and prevent the subsequent
        # requests, but then we'd lose stack trace info.
        files = ::JasmineRails::JhwAdapter.new.js_files
        files.collect! do |f|
          assets[f].to_a.collect { |a| a.logical_path }
        end
        files = files.flatten.uniq.collect { |f| File.join('/assets', f) }

        render json: files
      end
      fmt.html { redirect_to jasmine_path }
    end
  end
  
  private
  def webgl_start
    Jax.config.webgl_start
  end
end
