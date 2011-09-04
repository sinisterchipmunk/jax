module MockAssets
  def self.included(base)
    base.send(:before, :each) do
      # Remove Rails paths and then add only the @asset_dir for testing against
      @asset_dir = Dir.mktmpdir
      @original_paths = assets.paths
      assets.clear_paths
      assets.prepend_path @asset_dir
    end
    
    base.send(:after, :each) do
      # restore Rails paths
      assets.clear_paths
      @original_paths.each do |path|
        assets.append_path path
      end
    end
  end
  
  def create_asset(path, contents = nil)
    path = File.join(@asset_dir, path)
    FileUtils.mkdir_p File.dirname(path)
    File.open(path, "w") do |f|
      f.puts contents if contents
      yield f if block_given?
    end
  end
  
  def create_directory(path)
    FileUtils.mkdir_p File.join(@asset_dir, path)
  end
  
  def create_shader(path, contents = {})
    create_asset File.join("shaders", path, "common.glsl"),   contents[:common]   if contents[:common]
    create_asset File.join("shaders", path, "fragment.glsl"), contents[:fragment] if contents[:fragment]
    create_asset File.join("shaders", path, "vertex.glsl"),   contents[:vertex]   if contents[:vertex]
  end
  
  def assets
    Rails.application.assets
  end
  
  def asset(path)
    assets.find_asset(path).body
  end
end
