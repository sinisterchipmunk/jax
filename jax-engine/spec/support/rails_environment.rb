module Jax
  module Testing
    #
    # Example:
    #   include Jax::Testing::RailsEnvironment
    #   
    #   setup do
    #     create_asset "jax/resources/people/default.resource" do |f|
    #       f.puts "name: Colin"
    #     end
    #     
    #     create_file "version", "1.0.0"
    #   end
    #
    module RailsEnvironment
      def local(path)
        path =~ /^#{Regexp::escape ::Rails.root.to_s}/ ? path : ::Rails.root.join(path).to_s
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
      
      def create_asset(file, content = nil, &block)
        create_file File.join("app/assets", file), content, &block
      end
      
      def create_shader(path, contents = {})
        create_asset File.join("jax/shaders", path, "common.glsl"),   contents[:common]   if contents[:common]
        create_asset File.join("jax/shaders", path, "fragment.glsl"), contents[:fragment] if contents[:fragment]
        create_asset File.join("jax/shaders", path, "vertex.glsl"),   contents[:vertex]   if contents[:vertex]
      end

      def assets
        ::Rails.application.assets
      end

      def asset(path)
        asset = assets.find_asset(path)
        raise "asset not found: #{path} in #{@asset_dir}" unless asset
        asset.to_s
      end

      def append_to_file(file, content = nil, &block)
        if File.file?(local file)
          File.open(local(file), "a+") do |f|
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
        create_file("config/routes.rb", routes.sub(/Rails.application.routes.draw do$/, "\\0\n#{content}"))
      end
    end
  end
end