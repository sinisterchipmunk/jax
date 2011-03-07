class Jax::Packager
  attr_reader :pkg_path
  
  class << self
    def invoke
      pkg_dir = Jax.root.join("pkg")
      rm_rf pkg_dir
      mkdir_p pkg_dir
      Jax::Packager.new(pkg_dir)
    end
  end
  
  def initialize(pkg_path)
    @pkg_path = pkg_path
    compile_views
  end
  
  protected
  def compile_views
    lines = []
    
    Dir[Jax.root.join("app/views/**")].each do |dir|
      next unless File.directory?(dir)
      compiled_path = dir.gsub(/^#{Regexp::escape Jax.root.to_s}([\/\\]?)app[\/\\]views[\/\\]/, '')
      compiled_path.split(/\/\\/).inject("") do |current, segment|
        current.concat "." unless current.blank?
        current.concat segment

        compiled_view = "Jax.views.#{current}=(Jax.views.#{current}||{});"
        lines.push compiled_view unless lines.include?(compiled_view)
      end
    end
    
    lines.uniq!
    File.open(pkg_path.join("views.js"), "w") do |f|
      f.puts lines
    end
  end
end
