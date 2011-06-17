require 'rails/generators/test_case'
require 'active_support/testing/isolation'

# probably should have one of these in standard jax dist, but not
# necessarily *this* class
class Jax::Generators::TestCase < Rails::Generators::TestCase
  include ActiveSupport::Testing::Isolation unless ENV['DO_NOT_ISOLATE']
  
  def self.inherited(base)
    super
    base.class_eval do
      destination File.join(Jax.framework_root, "tmp/tmp")
      setup :prepare_destination
      teardown :restore_streams
      
      begin
        name = base.name.sub(/Test$/, '').split(/::/)
        konst = (name.first == "Jax") ? Object.class : Jax::Generators
        while const_name = name.shift
          konst = konst.const_get(const_name)
        end
        base.tests konst
      rescue
      end
    end
  end
  
  setup do
    require 'test_app'
    self.class.destination Jax.root
  end
  
  def generate(*args)
    run_generator args
  end
  
  def copy_routes
    routes = File.expand_path("../../../../lib/jax/generators/app/templates/config/routes.rb.tt", __FILE__)
    destination = File.join(destination_root, "config")
    FileUtils.mkdir_p destination
    FileUtils.cp routes, File.join(destination, "routes.rb")
  end
  
  def stub_file(path, content = nil)
    file = File.expand_path(path, destination_root)
    FileUtils.mkdir_p File.dirname(file)
    File.open(file, "w") do |f|
      f.print content if content
      yield f if block_given?
    end
    File.read(file)
  end
  
  def stdin
    mock_stream :stdin
  end
  
  def stdout
    mock_stream :stdout
  end
  
  def stderr
    mock_stream :stderr
  end
  
  def mock_stream(type)
    @mock_streams ||= {}
    @mock_streams[type] ||= StringIO.new
    @mock_streams[type].instance_eval do
      def returns(str)
        self.string = str
      end
    end
    prepare_mock_stream type, @mock_streams[type]
  end
  
  def real_streams
    @real_streams ||= {}
  end
  
  def prepare_mock_stream(type, stream)
    real_streams[type] ||= eval("$#{type}")
    set_stream type, stream
  end
  
  def restore_streams
    real_streams.each { |type, stream| set_stream type, stream }
  end
  
  def set_stream(type, stream)
    eval "$#{type} = stream"
  end
end
