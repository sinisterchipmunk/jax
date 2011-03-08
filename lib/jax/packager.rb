require 'sprockets'

class Jax::Packager
  attr_reader :pkg_path, :path, :file
  autoload :SprocketsTemplate, File.join(File.dirname(__FILE__), "packager/sprockets_template")
  
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
    secretary = Sprockets::Secretary.new(
            :root => Jax.root,
#            :asset_root => "public",
            :load_path => [Jax.root.to_s],
            :source_files => []
    )
    secretary.preprocessor.require(Jax::Packager::SprocketsTemplate.new(secretary.environment))
    
    mkdir_p File.dirname(@path)
    secretary.concatenation.save_to @path
    
    @file = File.open(@path, "a")
    Jax::ResourceCompiler.new.save(@file)
    file.close
  end
  
  private
  def localized_path(fi)
    fi.gsub(/^#{Regexp::escape Jax.root.to_s}[\/\\]?/, '')
  end
end
