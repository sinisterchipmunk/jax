class Jax::Shader
  attr_reader :common, :fragment, :vertex
  attr_accessor :name, :path, :exports, :manifest
  
  def initialize(path, name = File.basename(path))
    @exports = {}
    @name = name
    @path = path
    
    detect_sources
  end
  
  def description
    manifest && manifest['description']
  end
  
  def to_s
    "Jax.shaders['#{name}'] = new Jax.Shader(#{js_options.gsub(/<%/, '<%')});"
  end
  
  def default_options
    manifest && manifest['options'] || {}
  end
  
  def save_to(file_or_filename)
    if file_or_filename.kind_of?(String)
      File.open(filename, "w") { |f| f.puts to_s }
    else file_or_filename.puts to_s
    end
  end
  
  class << self
    def from(path)
      raise ArgumentError, "Expected path to be a directory" unless File.directory? path
      new(path)
    end
  end
  
  def common=(str)
    @common = preprocess(str).inspect
  end
  
  def fragment=(str)
    @fragment = preprocess(str).inspect
  end
  
  def vertex=(str)
    @vertex = preprocess(str).inspect
  end
  
  def preprocess(str)
    include_dependencies str
    intercept_export_directives str
#    intercept_import_directives str
#    prepend_export_definitions str
    
    str
  end
  
  private
  def detect_sources
    detect_ejs
    detect_manifest
  end
  
  def detect_manifest
    if File.file?(file = File.join(path, "manifest.yml"))
      yml = YAML::load(File.read(file))
      @manifest = yml || {}
    end
  end
  
  def detect_ejs
    %w(common fragment vertex).each do |name|
      if File.file?(file = File.join(path, "#{name}.ejs"))
        send("#{name}=", File.read(file))
      end
    end
  end
  
  def intercept_import_directives(str)
    str.gsub! /import\s*\(\s*([^\s]*)\s*\)/ do
      export_name($~[1])
    end
  end
  
  def prepend_export_definitions(str)
    exports.each do |name, export|
      str.insert 0, "#{export[:type]} #{name};\n"
    end
  end
  
  def intercept_export_directives(str)
    intercept_export_directives_with_assignment(str)
    intercept_export_directives_without_assignment(str)
  end
  
  def intercept_export_directives_without_assignment(str)
    str.gsub! /export\s*\(\s*([^\s]*),\s*([^\s]*)\s*\);?/ do |match|
      export $~[1], $~[2]
      match # we'll do the rest on the JS side
    end
  end
  
  def intercept_export_directives_with_assignment(str)
    str.gsub! /export\s*\(\s*([^\s]*),\s*([^\s]*),\s*([^\s]*)\s*\);?/ do |match|
      export $~[1], $~[2], $~[3]
      match # we'll do the rest on the JS side
    end
  end
  
  def export(type, name, value = name)
    exports[name] ||= { :type => type, :value => value }
    "#{exported_name(name)} = #{value};"
  end
  
  def include_dependencies(str)
    # look for Sprockets-style require directives
    str.gsub! /\/\/=\s*require\s*['"]([^'"]*)['"]/m do |sub|
      filename = $~[1]
      found = false
      paths = Jax.shader_load_paths
      result = nil
      for path in paths
        if File.file?(real = File.join(path, "#{filename}.ejs"))
          found = true
          macro_name = "dependency_#{filename}".underscore.gsub(/[^a-zA-Z0-9_]/, '_')
          result = <<-end_code
          #ifndef #{macro_name}
          #define #{macro_name}
      
          #{File.read(real)}
          #endif
          end_code
          break
        end
      end
      
      raise "Required file '#{filename}.ejs' not found in load paths #{paths.inspect} for shader '#{name}'!" if !found
      result
    end
  end
  
  def exported_name(name)
    "_#{self.name}_#{name}"
  end
  
  def export_keys_as_js
    "{" + exports.collect { |key,value| export_descriptor(key, value) }.join(",") + "}"
  end
  
  def export_descriptor(name, info)
    "#{name.to_s.inspect}:#{info[:type].to_s.inspect}"
  end
  
  def js_options
    result = "{"
    %w(common fragment vertex).each do |segment|
      data = send segment
      if data
        result += "  #{segment}:#{data},\n"
      end
    end
    result += "exports: #{export_keys_as_js},\n"
    result += "name: #{name.inspect}"
    result += "}"
    
    result
  end
end