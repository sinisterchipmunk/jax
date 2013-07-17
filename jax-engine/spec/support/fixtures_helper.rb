module FixturesHelper
  FIXTURES_PATH = File.expand_path("../fixtures", File.dirname(__FILE__))
  
  def stub_fixture(path, content = nil)
    file = File.expand_path(path, FIXTURES_PATH)
    FileUtils.mkdir_p File.dirname(file)
    File.open(file, "w") do |f|
      f.print content if content
      yield f if block_given?
    end
    File.read(file)
  end
  
  def fixture_path(relative)
    File.expand_path(relative, FIXTURES_PATH)
  end
  
  def fixture(relative)
    File.read(fixture_path relative)
  end
end
