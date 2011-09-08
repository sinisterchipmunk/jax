module RailsEnvironment
  def setup_rails_environment
    root = Rails.root.to_s

    create_empty_directory root
    create_directory 'app/assets' # required for Rails to pick up assets paths
    # Dir.chdir root
    create_file "config/routes.rb" do |f|
      f.puts "Rails.application.routes.draw do\nend"
    end
    
    Jax.reset_config!
  end
  
  def local(path)
    path =~ /^#{Regexp::escape Rails.root.to_s}/ ? path : Rails.root.join(path).to_s
  end
  
  def create_empty_directory dir
    FileUtils.rm_rf local(dir)
    create_directory dir
  end
  
  def create_directory(dir)
    FileUtils.mkdir_p local(dir)
  end
  
  def create_file(file, content = nil)
    create_directory File.dirname(file)
    File.open(local(file), "w") do |f|
      f.puts content if content
      yield f if block_given?
    end
  end
  
  def append_to_file(file, content = nil, &block)
    if File.file?(local file)
      File.open(local(file), "w+") do |f|
        f.puts content if content
        yield f if block_given?
      end
    else
      create_file(file, content, &block)
    end
  end
  
  def route(content)
    append_to_file "config/routes.rb" # create it if missing
    routes = File.read(local "config/routes.rb")
    create_file("config/routes.rb", routes.sub(/Rails.application.routes.draw do$/, "\\1#{content}"))
  end
end

World(RailsEnvironment)
