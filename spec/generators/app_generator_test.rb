require 'test_helper'
# require 'test_app'

pwd = File.join(Dir.pwd, "generator_tests")
EXPECTED_FILES = %w(
  app/controllers/application_controller.js
  app/helpers/application_helper.js
  app/models/
  app/resources/
  app/views/
  config/application.rb
  config/routes.rb 
  config/boot.rb
  public/webgl_not_supported.html       
  script/jax
  spec/javascripts/support/jasmine.yml
  spec/javascripts/support/jasmine_runner.rb
  spec/javascripts/support/spec_layout.html.erb
  spec/javascripts/support/spec_helpers/jax_spec_environment_helper.js
  spec/javascripts/support/spec_helpers/jax_spec_helper.js
  Rakefile 
  Gemfile
)

class Jax::Generators::App::AppGeneratorTest < Jax::Generators::TestCase
  test "should generate all expected files" do
    generate "test_app"
    
    EXPECTED_FILES.each do |file|
      assert_file File.join("test_app", file)
    end
  end
end
