require 'rake'

include FileUtils

namespace :jax do
  desc "Generate a standalone Web app"
  task :package do
    Jax::Packager.invoke
  end
end
