class Jax::SuiteController < ActionController::Base
  layout 'jax'
  helper_method :webgl_start
  include ActionView::Helpers::AssetTagHelper

  def controller
    self
  end

  def specs
    # Jax.config.concatenate_assets
    respond_to do |fmt|
      fmt.json do
        assets = Rails.application.assets

        # Tempting to just concat all sources here and prevent the subsequent
        # requests, but then we'd lose stack trace info.
        files = ::JasmineRails::JhwAdapter.new.js_files
        files.collect! do |f|
          if Jax.config.concatenate_assets
            f = [assets[f]]
          else
            f = assets[f].to_a
          end

          f.collect do |a|
            if Jax.config.concatenate_assets
              File.join '/assets', a.logical_path
            else
              File.join '/assets', "#{a.logical_path}?body=1"
            end
          end
        end
        files = files.flatten.uniq

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
