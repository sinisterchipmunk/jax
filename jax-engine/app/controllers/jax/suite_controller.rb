class Jax::SuiteController < ActionController::Base
  include JasmineRails::SpecRunnerHelper

  layout 'jax'
  helper_method :webgl_start
  include ActionView::Helpers::AssetTagHelper

  def controller
    self
  end

  def specs
    JasmineRails.reload_jasmine_config

    respond_to do |fmt|
      files = jasmine_js_files
      # fmt.json { render json: files.collect { |f| "/assets/#{f}" } }

      fmt.json do
        files.collect! do |f|
          f = Rails.application.assets[f].to_a
          f.collect do |a|
            File.join '/assets', "#{a.logical_path}?body=1"
          end
        end
        files = files.flatten.uniq

        render json: files
      end

      fmt.html { redirect_to jasmine_rails_path }
    end
  end
  
  private
  def webgl_start
    Jax.config.webgl_start
  end
end
