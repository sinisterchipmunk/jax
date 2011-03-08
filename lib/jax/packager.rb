require 'sprockets'

class Jax::Packager
  attr_reader :pkg_path, :path, :project
  autoload :SprocketsTemplate, File.join(File.dirname(__FILE__), "packager/sprockets_template")
  
  class << self
    def invoke
      pkg_dir = Jax.root.join("pkg")
      rm_rf pkg_dir
      
      package = new pkg_dir
      puts package.project.template
      
      package.build!
      
      puts
      puts "Build complete! Package is available at: "
      puts "    #{package.path}"
      puts
    end
  end
  
  def build!
    @secretary.preprocessor.require(project)
    
    mkdir_p File.dirname(@path)
    @secretary.concatenation.save_to @path
    
    file = File.open(@path, "a")
    Jax::ResourceCompiler.new.save(file)
    file.close
  end
  
  def initialize(pkg_path)
    @pkg_path = pkg_path
    @manifest = []
    
    @path = File.join(@pkg_path, "#{Jax.application.class.name.underscore}.js")
    @secretary = Sprockets::Secretary.new(
            :root => Jax.root,
#            :asset_root => "public",
            :load_path => [Jax.root.to_s],
            :source_files => []
    )
    @project = Jax::Packager::SprocketsTemplate.new(@secretary.environment)
  end
  
  private
  def localized_path(fi)
    fi.gsub(/^#{Regexp::escape Jax.root.to_s}[\/\\]?/, '')
  end
end
