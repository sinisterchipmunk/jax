require 'active_support/core_ext'

module Jax
  module Generators
    module Packager
      class PackageGenerator < Thor::Group
        include Thor::Actions

        def self.source_root
          File.expand_path("templates", File.dirname(__FILE__))
        end

        def build_package
          pkg_dir = Jax.root.join("pkg")
          remove_dir pkg_dir, :verbose => false

          package = Jax::Packager.new pkg_dir
          say "Packaging according to the following template:"
          say ""
          package.project.template.each { |line| say line }

          package.build!

          say
          say_status :done, "Build complete! Package is available at: ", :green
          say_status "",    "  #{package.pkg_path}"
          say
        end
      end
    end
  end
end
