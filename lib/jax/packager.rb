class Jax::Packager
  attr_reader :pkg_path, :path, :file
  
  class << self
    def invoke
      pkg_dir = Jax.root.join("pkg")
      rm_rf pkg_dir
      new pkg_dir
    end
  end
  
  def initialize(pkg_path)
    @pkg_path = pkg_path
    @manifest = []
    
    @path = File.join(@pkg_path, "#{Jax.application.class.name.underscore}.js")
    
    mkdir_p File.dirname(@path)
    @file = File.open(@path, "w")
    compile 'helpers'
    compile 'models'
    compile 'controllers'
    compile 'views'
    Jax::ResourceCompiler.new.save(@file)
    file.close
  end
  
  protected
  def compile(path)
    Dir[Jax.root.join("app", path, "**/*")].each do |fi|
      next if File.directory?(fi)
      file.puts File.read(fi)
      file.puts ''
    end
  end
  
  private
  def localized_path(fi)
    fi.gsub(/^#{Regexp::escape Jax.root.to_s}[\/\\]?/, '')
  end
end
