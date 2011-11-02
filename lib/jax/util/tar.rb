module Jax::Util::Tar
  def untar(tarfile, destination)
    Zlib::GzipReader.open tarfile do |z|
      Gem::Package::TarReader.new z do |tar|
        tar.each do |tarfile|
          destination_file = File.join destination, tarfile.full_name
          
          if tarfile.directory?
            FileUtils.mkdir_p destination_file
          else
            destination_directory = File.dirname(destination_file)
            FileUtils.mkdir_p destination_directory unless File.directory?(destination_directory)
            File.open destination_file, "w" do |f|
              binary = tarfile.read
              binary.force_encoding "UTF-8" if binary.respond_to?(:force_encoding)
              f.print binary
            end
          end
        end
      end
    end
  end
  
  def tar(path, filename)
    tarfile = StringIO.new("")
    Gem::Package::TarWriter.new(tarfile) do |tar|
      Dir[File.join(path, "**/*")].each do |file|
        mode = File.stat(file).mode
        relative_file = file.sub /^#{Regexp::escape path}\/?/, ''
        
        if File.directory?(file)
          tar.mkdir relative_file, mode
        else
          tar.add_file relative_file, mode do |f|
            f.write File.read(file)
          end
        end
      end
    end
    
    gz = StringIO.new("")
    z = Zlib::GzipWriter.new(gz)
    z.write tarfile.string
    z.close
    
    # zlib.close is required, but closes gz so we need a new gz
    gz = StringIO.new gz.string
    
    # this is probably bad practice (?) but it seems so silly
    # to create a whole class for just this accessor.
    class << gz; attr_accessor :path; end
    gz.path = filename
    
    gz
  end
end
