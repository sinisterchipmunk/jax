# Stand-in for ActiveRecord, invoked by Jax::Generators::ModelGenerator when --rails is passed.
# This lets us mock up the AR model generator so that we don't have to worry about what happens when
# AR can't find a database. Ultimately, this keeps Jax loosely coupled to AR, so that other ORMs can
# be used.

require 'rails/generators'

module Test
  module Generators
    class ModelGenerator < ::Rails::Generators::NamedBase
      def create_model
        create_file "app/models/#{file_name}.rb"
      end
    end
  end
end
