class Jax::Jasmine::Config < ::Jasmine::Config
  def src_files
    ['jax.js', 'application.js'].map do |f|
      if asset = ::Rails.application.assets[f]
        asset.to_a.map do |dep|
          "assets/" + dep.logical_path + "?body=true"
        end
      else
        []
      end
    end.flatten.uniq
  end

  def spec_files
    Jax.config.specs.each_logical_path.to_a.select do |lp|
      lp =~ /([sS]pec|[tT]est)\.js$/
    end.collect do |lp|
      if asset = Jax.config.specs[lp]
        asset.to_a.map do |dep|
          File.join dep.logical_path + "?body=true"
        end
      else
        []
      end
    end.flatten.uniq
  end

  def helpers
    Jax.config.specs.each_logical_path.to_a.select do |lp|
      lp =~ /[hH]elper\.js$/
    end.collect do |lp|
      if asset = Jax.config.specs[lp]
        asset.to_a.map do |dep|
          File.join dep.logical_path + "?body=true"
        end
      else
        []
      end
    end.flatten.uniq
  end
end
