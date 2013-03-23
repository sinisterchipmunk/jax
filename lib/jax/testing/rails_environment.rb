module Jax
  module Testing
    # Set up a subclass of Rails::Application and set `config.root` to a temporary
    # path prior to calling #setup_rails_environment.
    # 
    # Example:
    #   include Jax::Testing::RailsEnvironment
    #   
    #   setup do
    #     setup_rails_environment
    #     
    #     create_file "app/assets/jax/resources/people/default.resource" do |f|
    #       f.puts "name: Colin"
    #     end
    #     
    #     create_file "version", "1.0.0"
    #   end
    #
    module RailsEnvironment
      # WARNING: Set Rails.application.config.root to some temporary directory name
      # before calling this method! This method deletes the Rails root in order to set
      # up the fixture for the next test run.
      def setup_rails_environment
        root = ::Rails.root.to_s
        
        create_empty_directory root
        create_directory 'app/assets' # required for Rails to pick up assets paths
        create_file "config/routes.rb" do |f|
          f.puts "Rails.application.routes.draw do\nend"
        end
        
        create_directory "app/assets/jax/shaders"
        # create_directory "vendor/plugins/mine/app/assets/jax"
        route "mount Jax::Engine => '/jax'"
        FileUtils.chdir ENV['RAILS_ROOT'] if ENV['RAILS_ROOT']
        create_file 'spec/javascripts/support/jasmine.yml' do |f|
          f.puts <<-end_yml
src_files:
 - "application.{js,coffee}"

stylesheets:

helpers:
  - "helpers/**/*.{js,coffee}"

spec_files:
  - "**/*[Ss]pec.{js,coffee}"

src_dir: "app/assets/javascripts"

spec_dir: spec/javascripts

asset_paths:
 - "vendor/assets/javascripts"
     end_yml
        end
        Jax.reset_config!
        require 'thor'
        shell = Thor::Shell::Basic.new
        shell.instance_variable_set :"@mute", true
        Jax::Generators::InstallGenerator.start [], shell: shell
      end

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
        create_file File.join("app/assets/jax", file), content, &block
      end
      
      def create_shader(path, contents = {})
        create_asset File.join("shaders", path, "common.glsl"),   contents[:common]   if contents[:common]
        create_asset File.join("shaders", path, "fragment.glsl"), contents[:fragment] if contents[:fragment]
        create_asset File.join("shaders", path, "vertex.glsl"),   contents[:vertex]   if contents[:vertex]
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