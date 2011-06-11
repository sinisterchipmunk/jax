module FixturesHelper
  def fixture_file(relative)
    File.expand_path(relative, File.join(File.dirname(__FILE__), "../fixtures"))
  end
  
  def fixture(relative)
    File.read(fixture_file relative)
  end
end