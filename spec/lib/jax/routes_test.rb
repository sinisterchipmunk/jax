require 'test_helper'
require 'stringio'

class Jax::RoutesTest < ActiveSupport::TestCase
  def subject
    @subject ||= Jax::Routes.new
  end
  
  setup { @out = ""; @io = StringIO.new(@out) }
  
  test "should map root" do
    subject.root "welcome"
    subject.compile(@io)
    assert_equal 'Jax.routes.root(WelcomeController, "index");', @out.strip
  end
  
  test "should map" do
    subject.map "path/to", "welcome"
    subject.compile(@io)
    assert_equal 'Jax.routes.map("path/to", WelcomeController, "index");', @out.strip
  end

  test "should map with action name" do
    subject.map "path/to", "welcome", "another"
    subject.compile(@io)
    assert_equal 'Jax.routes.map("path/to", WelcomeController, "another");', @out.strip
  end
end