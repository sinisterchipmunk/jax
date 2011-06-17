require 'sprockets'
require 'fileutils'

class Jax::Packager
  include FileUtils
  attr_reader :pkg_path, :path, :project
  autoload :SprocketsTemplate, File.join(File.dirname(__FILE__), "packager/sprockets_template")
  
  class << self
    def invoke
      puts "DEPRECATED"
      puts
      puts "Please invoke the Jax packager with the following command:"
      puts
      puts "  jax package"
      puts
      puts "This notice will be removed sometime around Jax v1.2."
      puts
      puts
      
      Jax::Generators::Packager::PackageGenerator.start([])
    end
  end
  
  def build!
    @secretary.preprocessor.require(project)
    
    mkdir_p File.dirname(@path)
    @secretary.concatenation.save_to @path
    
    file = File.open(@path, "a")
    Jax.application.shaders.each { |shader| shader.save_to file }
    Jax::ResourceCompiler.new.save(file)
    Jax.application.routes.compile(file)
    
    file.close
    
    @secretary.install_assets
  end
  
  def initialize(pkg_path)
    @pkg_path = pkg_path
    @manifest = []
    
    @path = File.join(@pkg_path, "javascripts/#{Jax.application.class.name.underscore}.js")
    @secretary = Sprockets::Secretary.new(
            :root => Jax.root,
            :asset_root => @pkg_path.to_s,
            :load_path => Jax.application.javascript_load_paths,
            :source_files => []
    )
    @project = Jax::Packager::SprocketsTemplate.new(@secretary.environment)
  end
  
  private
  def localized_path(fi)
    fi.gsub(/^#{Regexp::escape Jax.root.to_s}[\/\\]?/, '')
  end
end
