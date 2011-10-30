require 'yaml'

class Jax::ResourceFile < Tilt::Template
  attr_reader :context
  
  def self.default_mime_type
    "application/javascript"
  end
  
  def prepare
  end
  
  def evaluate(scope, locals, &block)
    @context = scope
    "#{class_name}.addResources(#{to_json});"
  end
  
  def class_name
    File.basename(File.dirname(context.logical_path)).camelize.singularize
  end
  
  def resource_name
    File.basename(context.logical_path)
  end
  
  def to_json
    { resource_name => (YAML::load(data) || {}) }.to_json
  end
end
